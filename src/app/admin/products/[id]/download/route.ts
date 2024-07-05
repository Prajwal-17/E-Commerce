import db from "@/db/db"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const product = await db.product.findUnique({
    where: { id },
    select: { filePath: true, name: true },
  })

  if (product == null) return notFound()

  const { size } = await fs.stat(product.filePath)
  const file = await fs.readFile(product.filePath)
  const extension = product.filePath.split(".").pop()
  // console.log(`size${size} extension${extension}`)


  {/**
  -> Headers are set to provide information about the download:
  -> Content-Disposition: attachment(wont display): This tells the browser to treat the response as an attachment and prompt the user to save it.
  -> filename: This sets the suggested filename for the download, combining the product name and extension.
  -> Content-Length: This specifies the size of the file being downloaded.
  */}

  return new NextResponse(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
      "Content-Length": size.toString(),
    },
  })
}