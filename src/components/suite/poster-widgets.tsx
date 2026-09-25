import { format } from "date-fns";
import { EnergyHalo } from "@/components/suite/energy-halo";
import { useNow } from "@/hooks/use-now";
import { useOnline } from "@/hooks/use-online";
import { useSyncStore } from "@/lib/sync/store";
import { cn } from "@/lib/utils";

export function PosterWidgets() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#ff4710] px-4 py-8">
      <ClockCard />
    </div>
  );
}

export function ClockCard() {
  const now = useNow(1000);
  const online = useOnline();
  const steps = useSyncStore((s) => s.phoneSteps);
  const temp = useSyncStore((s) => s.phoneTemp);

  return (
    <article className="bank-card mx-auto flex w-full max-w-[260px] flex-col items-center rounded-[28px] px-3.5 pb-3.5 pt-3 text-center">
      <div className="relative aspect-square w-full">
        <EnergyHalo />
        <div className="absolute inset-[14%] flex items-center justify-center">
          <p
            className="bank-num text-[58px] font-semibold leading-none tracking-[-0.07em] text-[#f4f4f4] sm:text-[64px]"
            suppressHydrationWarning
          >
            {format(now, "HH:mm")}
          </p>
        </div>
      </div>

      <div className={cn("mt-1.5 grid w-full grid-cols-2", !online && "opacity-55")}>
        <ClockStat
          emoji="👟"
          label="Pasos"
          value={steps == null ? "—" : steps.toLocaleString("es-PE")}
        />
        <ClockStat emoji="☀️" label="Clima" value={temp == null ? "—" : `${temp}°`} />
      </div>
      {!online ? (
        <p className="mt-1 text-[10px] tracking-wide text-[#8a8a8a]">Sin conexión</p>
      ) : null}
    </article>
  );
}

function ClockStat({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <p className="flex h-4 items-center justify-center gap-1 text-[11px] text-[#8a8a8a]">
        <span className="clock-emo" aria-hidden="true">
          {emoji}
        </span>
        {label}
      </p>
      <p className="mt-0.5 min-h-[22px] w-full text-center text-[18px] font-semibold tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}
