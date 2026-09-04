import {
  ChevronsUpDown,
  LayoutGrid,
  BarChart3,
  Briefcase,
  Plug,
  Settings,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { SelviaLogoBadge } from "@/components/dashboard/logo";

const platformItems = [
  { label: "Dashboard", icon: LayoutGrid, active: true, chevron: false },
  { label: "Analytics", icon: BarChart3, active: false, chevron: false },
  { label: "Projects", icon: Briefcase, active: false, chevron: true },
  { label: "Integrations", icon: Plug, active: false, chevron: false },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-4 md:flex">
      <div className="flex items-center gap-2 px-2 pb-6">
        <SelviaLogoBadge />
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Selvia
        </span>
      </div>

      <button className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left shadow-sm transition-colors hover:bg-accent">
        <SelviaLogoBadge className="h-6 w-6 rounded-full" />
        <span className="flex-1 truncate text-sm font-medium text-foreground">
          Selvia Clínica
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Platform
      </div>
      <nav className="mb-6 flex flex-col gap-0.5">
        {platformItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
              item.active
                ? "bg-[#4D5C45]/10 font-medium text-[#4D5C45]"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.chevron && <ChevronRight className="h-3.5 w-3.5" />}
          </a>
        ))}
      </nav>

      <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        System
      </div>
      <nav className="flex flex-col gap-0.5">
        <a
          href="#"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          <span className="flex-1">Settings</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </nav>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Update
          </div>
          <div className="text-sm font-medium text-foreground">
            Product update
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            Performance boosts and UI polish.
          </div>
          <button className="mt-2 text-xs font-medium text-foreground underline underline-offset-2">
            Learn more
          </button>
        </div>
        <a
          href="#"
          className="flex items-center gap-2.5 px-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          Help Center
        </a>
      </div>
    </aside>
  );
}
