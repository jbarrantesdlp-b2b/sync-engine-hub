import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BatteryMedium, Footprints, Infinity as InfinityIcon, RefreshCw } from "lucide-react";
import { useNow } from "@/hooks/use-now";
import { useOnline } from "@/hooks/use-online";
import type { SlotId, WidgetConfig } from "@/lib/widgets/types";
import { cn } from "@/lib/utils";

type Battery = { level: number };

export function WidgetFace({
  config,
  className,
  frame = "size",
}: {
  config: WidgetConfig;
  className?: string;
  frame?: "size" | "thumb";
}) {
  const now = useNow(1000);
  const online = useOnline();
  const [battery, setBattery] = useState<number | null>(null);

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<Battery> };
    if (!nav.getBattery) return;
    let alive = true;
    nav.getBattery().then((bat) => {
      if (alive) setBattery(Math.round(bat.level * 100));
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className={cn("face-frame", frame === "thumb" ? "face-frame-thumb" : `face-frame-${config.size}`, className)}>
      <article
        className={cn("face", "face-master", `face-font-${config.font}`, `face-fx-${config.effect}`)}
        data-accent={config.accent}
      >
      {config.mode === "analog" ? <Analog now={now} /> : null}
      {config.mode === "digital" ? <Digital now={now} /> : null}
      {config.mode === "status" ? <Status now={now} online={online} battery={battery} /> : null}
      {config.mode === "split" ? <Split now={now} /> : null}
      {showSlot(config) ? (
        <SlotLine slot={config.slot} online={online} battery={battery} />
      ) : null}
      </article>
    </div>
  );
}

function showSlot(config: WidgetConfig) {
  if (config.slot === "none") return false;
  if (config.mode === "status" && (config.slot === "battery" || config.slot === "link")) return false;
  return true;
}

function SlotLine({
  slot,
  online,
  battery,
}: {
  slot: SlotId;
  online: boolean;
  battery: number | null;
}) {
  if (slot === "battery") {
    return (
      <p className="face-slot">
        <BatteryMedium className="face-ico" aria-hidden="true" />
        <span>{battery == null ? "—" : `${battery}%`}</span>
      </p>
    );
  }
  if (slot === "link") {
    return (
      <p className="face-slot">
        <RefreshCw className="face-ico" aria-hidden="true" />
        <span>{online ? "En línea" : "Sin red"}</span>
      </p>
    );
  }
  return (
    <p className="face-slot">
      <Footprints className="face-ico" aria-hidden="true" />
      <span>—</span>
    </p>
  );
}

function Analog({ now }: { now: Date }) {
  const s = now.getSeconds();
  const m = now.getMinutes();
  const h = now.getHours() % 12;
  const sec = s * 6;
  const min = m * 6 + s * 0.1;
  const hour = h * 30 + m * 0.5;
  const ticks = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="face-analog">
      <svg viewBox="0 0 200 200" className="face-dial" aria-hidden="true">
        {ticks.map((i) => {
          const major = i % 5 === 0;
          return (
            <line
              key={i}
              x1="100"
              y1={major ? 14 : 16}
              x2="100"
              y2={major ? 24 : 20}
              className={major ? "tick-major" : "tick-minor"}
              transform={`rotate(${i * 6} 100 100)`}
            />
          );
        })}
        <line x1="100" y1="108" x2="100" y2="58" className="hand" strokeWidth="3" transform={`rotate(${hour} 100 100)`} />
        <line x1="100" y1="112" x2="100" y2="36" className="hand" strokeWidth="2.5" transform={`rotate(${min} 100 100)`} />
        <line x1="100" y1="118" x2="100" y2="28" className="hand-sec" transform={`rotate(${sec} 100 100)`} />
        <circle cx="100" cy="100" r="4" className="hand-cap" />
      </svg>
      <InfinityIcon className="dial-mark" aria-hidden="true" />
    </div>
  );
}

function Digital({ now }: { now: Date }) {
  return (
    <div className="face-stack">
      <p className="face-time" suppressHydrationWarning>
        {format(now, "HH:mm")}
      </p>
      <p className="face-sub">
        <span suppressHydrationWarning>{format(now, "HH:mm:ss")}</span>
        <span suppressHydrationWarning>{format(now, "d MMM, yy", { locale: es })}</span>
      </p>
    </div>
  );
}

function Status({
  now,
  online,
  battery,
}: {
  now: Date;
  online: boolean;
  battery: number | null;
}) {
  return (
    <div className="face-stack">
      <p className="face-time" suppressHydrationWarning>
        {format(now, "HH:mm")}
      </p>
      <p className="face-meta">
        <BatteryMedium className="face-ico" aria-hidden="true" />
        <span>{battery == null ? "—" : `${battery}%`}</span>
        <RefreshCw className="face-ico" aria-hidden="true" />
        <span>{online ? "En línea" : "Sin red"}</span>
      </p>
    </div>
  );
}

function Split({ now }: { now: Date }) {
  return (
    <div className="face-split">
      <div className="face-split-nums">
        <span suppressHydrationWarning>{format(now, "HH")}</span>
        <span className="face-split-min" suppressHydrationWarning>
          {format(now, "mm")}
        </span>
      </div>
      <div className="face-split-side">
        <p suppressHydrationWarning>{format(now, "d MMM, yyyy", { locale: es })}</p>
      </div>
    </div>
  );
}
