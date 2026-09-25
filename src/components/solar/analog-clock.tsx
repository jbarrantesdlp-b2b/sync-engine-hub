import { useId, useState } from "react";
import { cn } from "@/lib/utils";

function handSync(now: Date) {
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const hourDeg = (hours + minutes / 60 + seconds / 3600) * 30;
  const minDeg = (minutes + seconds / 60) * 6;
  const secDeg = seconds * 6;
  return {
    hourDeg,
    minDeg,
    secDeg,
    hourDelay: -(hourDeg / 360) * 43200,
    minDelay: -(minDeg / 360) * 3600,
    secDelay: -(secDeg / 360) * 60,
  };
}

export function AnalogClock({
  numbered = false,
  className,
}: {
  numbered?: boolean;
  className?: string;
}) {
  const glowId = useId();
  const [sync] = useState(() => handSync(new Date()));

  return (
    <div className={cn("clock-face relative aspect-square w-full text-solar", className)}>
      <svg viewBox="0 0 200 200" className="size-full" aria-hidden="true">
        <defs>
          <radialGradient id={glowId} cx="50%" cy="92%" r="62%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="42%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="98" fill={`url(#${glowId})`} />
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % 5 === 0;
          const a = (i * 6 * Math.PI) / 180;
          const inner = major ? 80 : 86;
          const outer = 92;
          return (
            <line
              key={i}
              x1={100 + inner * Math.sin(a)}
              y1={100 - inner * Math.cos(a)}
              x2={100 + outer * Math.sin(a)}
              y2={100 - outer * Math.cos(a)}
              stroke={major ? "currentColor" : "rgba(255,246,234,0.22)"}
              strokeWidth={major ? 2 : 0.7}
              strokeLinecap="round"
            />
          );
        })}
        {numbered
          ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return (
                <text
                  key={n}
                  x={100 + 68 * Math.sin(a)}
                  y={100 - 68 * Math.cos(a) + 4.5}
                  textAnchor="middle"
                  fill="rgba(255,246,234,0.88)"
                  fontSize="13"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight="500"
                >
                  {n}
                </text>
              );
            })
          : null}
        <path
          d="M97 132 L101.5 142 L99.2 142 L103 152 L98 141.5 L100.4 141.5 Z"
          fill="currentColor"
          opacity="0.95"
        />
      </svg>
      <span className="clock-arm clock-hour" style={{ transform: `rotate(${sync.hourDeg}deg)`, animationDelay: `${sync.hourDelay}s` }} />
      <span className="clock-arm clock-minute" style={{ transform: `rotate(${sync.minDeg}deg)`, animationDelay: `${sync.minDelay}s` }} />
      <span className="clock-arm clock-second" style={{ transform: `rotate(${sync.secDeg}deg)`, animationDelay: `${sync.secDelay}s` }} />
      <span className="clock-cap"><i /></span>
    </div>
  );
}

export function InfinityMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 14" className={className} aria-hidden="true">
      <path
        d="M7 7c0-2.6 2-4.6 4.4-4.6 2.8 0 4.2 2.4 6.6 4.6-2.4 2.2-3.8 4.6-6.6 4.6C9 11.6 7 9.6 7 7Zm14 0c0 2.6-2 4.6-4.4 4.6-2.8 0-4.2-2.4-6.6-4.6 2.4-2.2 3.8-4.6 6.6-4.6C19 2.4 21 4.4 21 7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
