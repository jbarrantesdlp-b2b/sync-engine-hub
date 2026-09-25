import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNow } from "@/hooks/use-now";

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const MARKS = [5, 10, 15, 20, 25, 30, 35, 40, 45];

function Dial() {
  const minors = Array.from({ length: 60 }, (_, index) => {
    if (index % 5 === 0) return null;
    const angle = (index / 60) * Math.PI * 2 - Math.PI / 2;
    return { x1: 100 + Math.cos(angle) * 80, y1: 100 + Math.sin(angle) * 80, x2: 100 + Math.cos(angle) * 84, y2: 100 + Math.sin(angle) * 84 };
  }).filter((tick) => tick !== null);
  const majors = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
    return { x1: 100 + Math.cos(angle) * 76, y1: 100 + Math.sin(angle) * 76, x2: 100 + Math.cos(angle) * 88, y2: 100 + Math.sin(angle) * 88 };
  });

  return (
    <svg className="lock-dial" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="lock-wash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3ad7f5" stopOpacity="0.16" />
          <stop offset="62%" stopColor="#3ad7f5" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#3ad7f5" stopOpacity="0" />
        </radialGradient>
        <filter id="lock-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="100" cy="100" r="74" fill="url(#lock-wash)" />
      <circle className="lock-ring" cx="100" cy="100" r="70" />
      {minors.map((tick) => (
        <line key={`${tick.x1}-${tick.y1}`} className="is-minor" x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} />
      ))}
      {majors.map((tick) => (
        <line key={`${tick.x1}-${tick.y1}`} className="is-major" x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} />
      ))}
      <g className="lock-spin" filter="url(#lock-glow)">
        <circle className="lock-arc" cx="100" cy="100" r="93" />
      </g>
      {MARKS.map((mark) => {
        const angle = -Math.PI / 2 + ((40 - mark) / 60) * Math.PI * 2;
        const x = 100 + Math.cos(angle) * 60;
        const y = 100 + Math.sin(angle) * 60;
        return (
          <text key={mark} x={x} y={y}>
            {String(mark).padStart(2, "0")}
          </text>
        );
      })}
    </svg>
  );
}

export function LockFace() {
  const now = useNow(1000);

  return (
    <div className="lock-face">
      <Dial />
      <p className="lock-hh" suppressHydrationWarning>
        {format(now, "HH")}
      </p>
      <p className="lock-pill">
        <b suppressHydrationWarning>{format(now, "mm")}</b>
      </p>
      <div className="lock-when">
        <p suppressHydrationWarning>
          {now.getDate()} {MONTHS[now.getMonth()]} {now.getFullYear()}
        </p>
        <p suppressHydrationWarning>{format(now, "EEEE", { locale: es })}</p>
      </div>
    </div>
  );
}

export function LockScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="lock-full">
      <button type="button" className="lock-close" onClick={onClose}>
        Widgets
      </button>
      <LockFace />
    </div>
  );
}
