import { CircleDollarSign, ArrowRight } from "lucide-react";

export function CampaignRoiCard() {
  return (
    <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          Campaign ROI Snapshot
        </div>
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Full Snapshot
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2">
        <div>
          <div className="text-xs text-muted-foreground">Spend</div>
          <div className="text-lg font-semibold text-foreground">$43K</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Revenue</div>
          <div className="text-lg font-semibold text-foreground">$212K</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">ROAS</div>
          <div className="text-lg font-semibold text-foreground">4.94x</div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Spend vs return mix</span>
          <span className="font-medium text-foreground">20% / 80%</span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-[#4D5C45]" style={{ width: "20%" }} />
          <div className="h-full bg-muted-foreground/30" style={{ width: "80%" }} />
        </div>

        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4D5C45]" />
            <div>
              <div className="text-xs text-muted-foreground">Ad spend</div>
              <div className="text-sm font-medium text-foreground">$43K</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
            <div>
              <div className="text-xs text-muted-foreground">Revenue retained</div>
              <div className="text-sm font-medium text-foreground">$169K</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
