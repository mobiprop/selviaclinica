import type { ReactNode, ReactElement, CSSProperties } from "react";
import { cloneElement } from "react";
import { SelviaLogoBadge } from "@/components/dashboard/logo";

/** Page-specific heading block (title + optional subtitle), sized to scale with the same fluid rhythm as the rest of AuthLayout. */
export function AuthHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ gap: "clamp(0.25rem, 0.6vh, 0.4rem)", marginBottom: "clamp(1.25rem, 3vh, 2rem)" }}
    >
      <h1 className="font-semibold tracking-tight text-foreground" style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.4rem)" }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground" style={{ fontSize: "clamp(0.8rem, 0.95vw, 0.95rem)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Scales a lucide icon (e.g. the success/error glyph above a heading) with the same fluid rhythm, without touching every call site's own size classes. */
export function AuthIcon({ icon }: { icon: ReactElement<{ className?: string; style?: CSSProperties }> }) {
  return cloneElement(icon, {
    style: { height: "clamp(2rem, 4vw, 2.75rem)", width: "clamp(2rem, 4vw, 2.75rem)" },
  });
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <div
        className="flex w-full flex-col items-center justify-center bg-background lg:shrink-0"
        style={{
          padding: "clamp(1.5rem, 4vw, 3rem)",
          width: "clamp(400px, 32vw, 640px)",
        }}
      >
        <div className="w-full" style={{ maxWidth: "clamp(320px, 26vw, 480px)" }}>
          <div className="flex flex-col items-center text-center" style={{ gap: "clamp(0.5rem, 1.2vh, 0.75rem)", marginBottom: "clamp(1.5rem, 4vh, 3rem)" }}>
            <SelviaLogoBadge style={{ height: "clamp(1.75rem, 3vw, 2.5rem)", width: "clamp(1.75rem, 3vw, 2.5rem)" }} />
            <span className="font-semibold tracking-tight text-foreground" style={{ fontSize: "clamp(0.9rem, 1.1vw, 1.15rem)" }}>
              Selvia Clínica
            </span>
          </div>
          {children}
        </div>
      </div>

      <div
        className="relative hidden flex-1 items-center justify-center overflow-hidden bg-muted/40 lg:flex"
        style={{ padding: "clamp(2rem, 6vw, 6rem)" }}
      >
        <div style={{ maxWidth: "clamp(380px, 34vw, 620px)" }}>
          <h1 className="font-semibold tracking-tight text-foreground" style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.5rem)", lineHeight: 1.15 }}>
            Run your clinic with clarity and control.
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: "clamp(0.8rem, 1vw, 1rem)", marginTop: "clamp(0.5rem, 1.2vh, 1rem)" }}>
            Patients, revenue, supplies, and your team&apos;s calendars — all in one dashboard built for Selvia.
          </p>
          <div
            className="rounded-xl border border-border bg-card shadow-sm"
            style={{ marginTop: "clamp(1.5rem, 4vh, 3rem)", padding: "clamp(0.75rem, 1.6vw, 1.5rem)" }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: "clamp(0.5rem, 1.4vh, 1rem)" }}>
              <span className="font-medium text-muted-foreground" style={{ fontSize: "clamp(0.7rem, 0.85vw, 0.85rem)" }}>
                This month
              </span>
              <span
                className="rounded-full bg-emerald-100 font-medium text-emerald-700"
                style={{ fontSize: "clamp(0.6rem, 0.75vw, 0.75rem)", padding: "clamp(0.1rem, 0.3vw, 0.2rem) clamp(0.4rem, 0.7vw, 0.6rem)" }}
              >
                +12.4%
              </span>
            </div>
            <div className="grid grid-cols-2" style={{ gap: "clamp(0.5rem, 1.2vw, 0.9rem)" }}>
              <div className="rounded-lg bg-muted/50" style={{ padding: "clamp(0.6rem, 1.2vw, 1rem)" }}>
                <div className="text-muted-foreground" style={{ fontSize: "clamp(0.65rem, 0.8vw, 0.8rem)" }}>
                  Appointments
                </div>
                <div className="font-semibold text-foreground" style={{ fontSize: "clamp(1rem, 1.5vw, 1.3rem)" }}>
                  142
                </div>
              </div>
              <div className="rounded-lg bg-muted/50" style={{ padding: "clamp(0.6rem, 1.2vw, 1rem)" }}>
                <div className="text-muted-foreground" style={{ fontSize: "clamp(0.65rem, 0.8vw, 0.8rem)" }}>
                  Revenue
                </div>
                <div className="font-semibold text-foreground" style={{ fontSize: "clamp(1rem, 1.5vw, 1.3rem)" }}>
                  $380,000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
