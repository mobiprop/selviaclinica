import type { CSSProperties } from "react";

type LogoProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Selvia Clínica mark: a leaf silhouette whose right contour reads as a
 * face in profile, with a thin cutout vein/hairline running through it.
 */
export function SelviaMark({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M58 6C62 6 66 10 70 18C74 28 70 38 68 44C70 48 76 50 78 52C80 58 70 62 70 66C70 70 74 71 76 75C74 78 66 80 64 86C62 90 60 96 58 102C50 100 35 95 24 82C14 70 15 55 20 50C22 25 40 10 58 6ZM55 14C46 30 41 48 45 64C48 78 54 88 58 92C48 78 41 48 55 14Z"
      />
    </svg>
  );
}

export function SelviaLogoBadge({ className, style }: LogoProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-md bg-[#4D5C45] text-[#F5F2EA] ${className ?? "h-7 w-7"}`}
      style={style}
    >
      {/* Percentage-sized so the mark scales proportionally with whatever size the badge itself is given, instead of staying a fixed pixel size inside a resized box. */}
      <SelviaMark className="h-[55%] w-[55%]" />
    </div>
  );
}
