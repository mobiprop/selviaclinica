import { Layers, ArrowRight } from "lucide-react";

const SEGMENTS = [
  { label: "Website", value: 1445, color: "#4D5C45" },
  { label: "Paid Ads", value: 903, color: "#8B9683" },
  { label: "Emails", value: 722, color: "#C7CCC1" },
  { label: "Referral", value: 451, color: "#E7E9E3" },
];

const TOTAL = SEGMENTS.reduce((sum, s) => sum + s.value, 0);
const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function LeadSourcesCard() {
  let offset = 0;
  const arcs = SEGMENTS.map((segment) => {
    const fraction = segment.value / TOTAL;
    const dash = fraction * CIRCUMFERENCE;
    const arc = { ...segment, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Lead Sources Breakdown
        </div>
        <a
          href="#"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          More details
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>

      <div className="flex flex-1 items-center gap-6">
        <div className="relative shrink-0">
          <svg width={168} height={168} viewBox="0 0 168 168">
            <g transform="translate(84,84) rotate(-90)">
              {arcs.map((arc) => (
                <circle
                  key={arc.label}
                  r={RADIUS}
                  cx={0}
                  cy={0}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={22}
                  strokeDasharray={`${arc.dash} ${CIRCUMFERENCE - arc.dash}`}
                  strokeDashoffset={-arc.offset}
                />
              ))}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              {TOTAL.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">total leads</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col divide-y divide-border">
          {SEGMENTS.map((segment) => (
            <div
              key={segment.label}
              className="flex items-center justify-between gap-3 py-2 pl-3 border-l-2"
              style={{ borderColor: segment.color }}
            >
              <span className="text-sm text-muted-foreground">{segment.label}</span>
              <span className="text-sm font-medium text-foreground">
                {segment.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
