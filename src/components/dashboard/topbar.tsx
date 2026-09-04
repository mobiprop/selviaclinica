import { PanelLeft, LayoutGrid, Search, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type DashboardTopbarProps = {
  title?: string;
  icon?: LucideIcon;
};

export function DashboardTopbar({ title = "Dashboard", icon: Icon = LayoutGrid }: DashboardTopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
        <PanelLeft className="h-4 w-4" />
      </button>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="hidden items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm hover:bg-accent sm:flex">
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-4 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
        <button className="relative rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#4D5C45]" />
        </button>
        <Avatar className="h-7 w-7">
          <AvatarImage src="" alt="User" />
          <AvatarFallback className="bg-[#4D5C45] text-xs text-[#F5F2EA]">
            MU
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
