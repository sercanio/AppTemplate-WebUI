import './App.css'
import AdminHeader from './components/admin-header'
import AdminFooter from './components/admin-footer'
import { Sidebar, SidebarProvider } from './components/ui/sidebar'

export default function App() {
  return (
    <SidebarProvider>
      <Sidebar />
      <AdminHeader />
      <div>
        {/* This component is no longer the main entry point */}
        {/* Routing is now handled by AppRouter in main.tsx */}
      </div>
      <AdminFooter />
    </SidebarProvider>
  );
}
