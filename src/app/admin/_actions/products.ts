"use server"

import fs from "fs/promises"
import { number, z } from 'zod';
import { notFound, redirect } from "next/navigation";
import prisma from "@/db/db";

const FileSchema = z.instanceof(File, { message: "Required" });
//refine is used to filter out only a particular type of file like image ..etc
const ImageSchema = FileSchema.refine(file => file.size === 0 || file.type.startsWith("image/"))

//coerce converts the value into number,boolean,...etc in zod
const addSchema = z.object({
  name: z.string().min(1),
  priceInCents: z.coerce.number().int().min(1),
  description: z.string().min(1),
  file: FileSchema.refine(file => file.size > 0, "Required"),
  image: ImageSchema.refine(file => file.size > 0, "Required")
})

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success == false) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data;

  await fs.mkdir("products", { recursive: true })
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))

  await fs.mkdir("public/products", { recursive: true })
  const imagePath = `/products/${crypto.randomUUID()}-${data.file.name}`
  await fs.writeFile(`public${imagePath}`, Buffer.from(await data.image.arrayBuffer()))

  await prisma.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    }
  })
  redirect('/admin/products')
}

const editSchema = addSchema.extend({
  file: FileSchema.optional(),
  image: ImageSchema.optional(),
})

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()))
  if (result.success === false) {
    return result.error.formErrors.fieldErrors
  }

  const data = result.data
  const product = await prisma.product.findUnique({ where: { id } })

  if (product == null) return notFound()

  let filePath = product.filePath
  if (data.file != null && data.file.size > 0) {
    await fs.unlink(product.filePath)
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()))
  }

  let imagePath = product.imagePath
  if (data.image != null && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`)
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    )
  }

  await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  })

  redirect("/admin/products")
}

export async function ToggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await prisma.product.update({
    where: { id },
    data: { isAvailableForPurchase }
  })
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.delete({
    where: { id }
  })

  if (product == null) return notFound();

  await fs.unlink(product.filePath);
  await fs.unlink(`public${product.imagePath}`);
}