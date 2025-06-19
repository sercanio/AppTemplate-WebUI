import './App.css'
import AdminHeader from './components/admin-header'
import AdminFooter from './components/admin-footer'
import { Sidebar, SidebarProvider } from './components/ui/sidebar'
import { ThemeProvider } from "./contexts/ThemeContext"

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <SidebarProvider>
        <Sidebar />
        <AdminHeader />
        <AdminFooter />
      </SidebarProvider>
    </ThemeProvider>
  );
}
