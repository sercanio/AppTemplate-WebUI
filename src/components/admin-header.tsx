import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { ThemeToggle } from "./theme-toggle";

export default function AdminHeader() {
  return (
    <header className="flex h-15 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <a
        href="/"
        target="_blank"
        className="text-foreground hover:text-yellow-green font-medium transition-colors duration-200"
      >
        Home
      </a>
      
      {/* Spacer to push theme toggle to the right */}
      <div className="flex-1" />
      
      {/* Theme Toggle */}
      <ThemeToggle />
    </header>
  );
}