import { NavLink, Nav } from "@/components/Nav";

//forces next js to not cache admin pages  
export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (<>
    <Nav>
      <NavLink href="/">Home</NavLink>
      <NavLink href="/products">Products</NavLink>
      <NavLink href="/Orders">Orders</NavLink>
    </Nav>
    <div className="container my-6">{children}</div>
  </>)
}
