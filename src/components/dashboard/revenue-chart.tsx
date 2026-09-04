const VALUES = [
  24.0, 23.4, 19.6, 20.0, 20.6, 19.8, 21.0, 21.9, 20.5, 19.2, 19.8, 20.3, 19.5,
  20.8, 21.6, 20.2, 19.0, 18.2, 17.5, 18.3, 17.2, 16.5, 15.8, 16.5, 17.8, 16.9,
  15.9, 16.8, 17.3, 17.0,
];

const X_LABELS = ["Mar 29", "Apr 3", "Apr 8", "Apr 13", "Apr 18", "Apr 23", "Apr 28"];
const Y_LABELS = [25, 20, 15, 10, 5, 0];

const WIDTH = 1200;
const HEIGHT = 280;
const MAX = 25;

function toPoint(i: number, value: number) {
  const x = (i / (VALUES.length - 1)) * WIDTH;
  const y = HEIGHT - (value / MAX) * HEIGHT;
  return [x, y] as const;
}

export function RevenueChart() {
  const points = VALUES.map((v, i) => toPoint(i, v));
  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex text-xs text-muted-foreground">
        <div className="flex w-10 flex-col justify-between py-1 text-right sm:w-12">
          {Y_LABELS.map((label) => (
            <span key={label}>{label === 0 ? "0" : `${label}k`}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="h-64 w-full overflow-visible"
          >
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4D5C45" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#4D5C45" stopOpacity="0" />
              </linearGradient>
            </defs>
            {Y_LABELS.map((label) => {
              const y = HEIGHT - (label / MAX) * HEIGHT;
              return (
                <line
                  key={label}
                  x1={0}
                  x2={WIDTH}
                  y1={y}
                  y2={y}
                  stroke="#e1e0d9"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              );
            })}
            <path d={areaPath} fill="url(#revenueFill)" stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke="#4D5C45"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            {X_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
