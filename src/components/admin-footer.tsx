import { Heart } from "lucide-react";

export default function AdminFooter() {

  return (
    <footer className="border-t bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Copyright</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            Made with&nbsp;<Heart className="h-3 w-3 text-red-500" />&nbsp;for planet
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="text-xs">Admin Panel v1.0</span>
        </div>
      </div>
    </footer>
  );
}
