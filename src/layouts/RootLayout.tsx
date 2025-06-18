import { Outlet } from 'react-router-dom'
import AdminHeader from '../components/admin-header'
import AdminFooter from '../components/admin-footer'
import { AdminSidebar } from '../components/admin-sidebar'
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar'

export default function RootLayout() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <AdminFooter />
      </SidebarInset>
    </SidebarProvider>
  )
}
