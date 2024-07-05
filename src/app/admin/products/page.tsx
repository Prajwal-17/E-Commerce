import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ActiveToggleDropdownItem, DeleteDropdownItem } from "./_components/ProductActions";

// asChild This allows you to create a custom button that behaves like a link but retains the styling and functionality of the  component.
export default function AdminProductsPage() {
  return (<>
    <div className="flex justify-between items-center gap-4">
      <PageHeader>Products</PageHeader>
      <Button asChild>
        <Link href="/admin/products/new">Add Product</Link>
      </Button>
    </div>
    <ProductsTable />
  </>)
}

async function ProductsTable() {

  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: { select: { orders: true } }
    },
    orderBy: { name: "asc" }
  })

  if (products.length === 0) return <div>No Products Found</div>

  return (<>
    <Table>
      <TableHeader>
        <TableRow className="w-0">
          <TableHead>
            <span className="sr-only">Available for purchase</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map(product => (
          <TableRow key={product.id}>
            <TableCell>
              {product.isAvailableForPurchase ?
                (
                  <><CheckCircle2 /></>
                ) : (
                  <>
                    <XCircle className="stroke-destructive" />
                  </>)
              }
            </TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{formatCurrency(product.priceInCents / 100)}</TableCell>
            <TableCell>{formatNumber(product._count.orders)}</TableCell>
            <TableCell>
              <DropdownMenu >
                <DropdownMenuTrigger>
                  <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-50 outline flex flex-col gap-2 rounded-lg px-4 py-3  text-md">
                  <DropdownMenuItem >
                    <a download href={`/admin/products/${product.id}/download`}>Download</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem >
                    <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                  </DropdownMenuItem>
                  <ActiveToggleDropdownItem id={product.id}
                    isAvailableForPurchase={product.isAvailableForPurchase} />
                  {/* <DropdownMenuSeparator /> */}
                  <DeleteDropdownItem id={product.id} disabled={product._count.orders > 0} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>)
}