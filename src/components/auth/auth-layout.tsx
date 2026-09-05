import type { ReactNode } from "react";
import { SelviaLogoBadge } from "@/components/dashboard/logo";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full flex-col items-center justify-center bg-background p-6 lg:w-[440px] lg:shrink-0">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <SelviaLogoBadge />
            <span className="text-[15px] font-semibold tracking-tight text-foreground">Selvia Clínica</span>
          </div>
          {children}
        </div>
      </div>

      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-muted/40 p-12 lg:flex">
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Run your clinic with clarity and control.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Patients, revenue, supplies, and your team&apos;s calendars — all in one dashboard built for Selvia.
          </p>
          <div className="mt-10 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">This month</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                +12.4%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-[11px] text-muted-foreground">Appointments</div>
                <div className="text-lg font-semibold text-foreground">142</div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-[11px] text-muted-foreground">Revenue</div>
                <div className="text-lg font-semibold text-foreground">$380,000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
