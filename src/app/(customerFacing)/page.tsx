import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard"
import { Button } from "@/components/ui/button"
import prisma from "@/db/db"
import { Product } from "@prisma/client"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

type ProductGridSectionProps = {
  title: string,
  productsFetcher: () => Promise<Product[]>
}

async function getNewestProducts() {
  return prisma.product.findMany({
    where: {
      isAvailableForPurchase: true
    },
    orderBy: { createdAt: "desc" }
  })
}

async function getPopularProducts() {
  return prisma.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { orders: { _count: "desc" } }
  })
}

export default function HomePage() {
  return (<>
    <main className="space-y-12">
      <ProductGridSection title="Most Popular" productsFetcher={getPopularProducts} />
      <ProductGridSection title="New Products" productsFetcher={getNewestProducts} />
    </main>
  </>)
}


function ProductGridSection({ productsFetcher, title }: ProductGridSectionProps) {
  return (<>
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button className="outline" asChild>
          <Link href="/products" className="space-x-2">
            <span>View all</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        }>
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  </>)
}

async function ProductSuspense({ productsFetcher }: { productsFetcher: () => Promise<Product[]> }
) {
  return (

    (await productsFetcher()).map(product => (
      <ProductCard key={product.id} {...product} />
    ))
  )
}