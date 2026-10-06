import type { SVGProps } from "react";

const PATHS = {
  today: "M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 11a1 1 0 1 0 1 1",
  kitchen: "M4 11h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6ZM2 11h20M9 7V4M12 7V3M15 7V4",
  plus: "M12 5v14M5 12h14",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  trash: "M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3",
  chevronRight: "m9 6 6 6-6 6",
  chevronLeft: "m15 6-6 6 6 6",
  check: "m5 12 5 5 9-10",
  close: "M6 6l12 12M18 6 6 18",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  minus: "M5 12h14",
  scale: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM9 9a4 4 0 0 1 6 0l-3 3",
  steps: "M8 3c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5ZM16 9c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5ZM6 16h4M14 21h4",
  meal: "M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 0-3 3-3 6s1 4 3 4v8",
  workout: "M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12",
  cart: "M3 4h2l2 12h11l2-8H6M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  alert: "M12 8v5M12 16.5v.5M12 3l9.5 17h-19L12 3Z",
} as const;

export type IconName = keyof typeof PATHS;

type IconProps = SVGProps<SVGSVGElement> & { name: IconName; size?: number };

export function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
