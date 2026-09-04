import { UserPlus, ArrowRight, ArrowUp } from "lucide-react";

const VALUES = [
  30, 55, 40, 70, 50, 85, 60, 95, 65, 100, 70, 90, 55, 80, 60, 88, 50, 75, 45,
  82, 58, 92, 68, 78, 48, 70, 42, 60, 38, 55,
];

const WIDTH = 400;
const HEIGHT = 90;
const MAX = 100;

function toPoint(i: number, value: number) {
  const x = (i / (VALUES.length - 1)) * WIDTH;
  const y = HEIGHT - (value / MAX) * HEIGHT;
  return [x, y] as const;
}

export function NewLeadsCard() {
  const points = VALUES.map((v, i) => toPoint(i, v));
  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          New Leads / Day
        </div>
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View leads
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          3,381
        </span>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <ArrowUp className="h-3 w-3" />
          1.2%
        </span>
      </div>
      <div className="mb-2 text-xs text-muted-foreground">leads in last 30 days</div>

      <div className="mt-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-20 w-full"
        >
          <defs>
            <linearGradient id="leadsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4D5C45" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#4D5C45" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#leadsFill)" stroke="none" />
          <path
            d={linePath}
            fill="none"
            stroke="#4D5C45"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
