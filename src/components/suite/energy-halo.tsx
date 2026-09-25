import { cn } from "@/lib/utils";

/** Preview of the Android ProgressBar halo: static track + sweep arc, 2.4s rotate. */
export function EnergyHalo({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Anillo de energía girando alrededor del reloj"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <div className="absolute inset-[6%] rounded-full border-[11px] border-[#6b32b8]" />
      <div className="halo-spin absolute inset-[6%] rounded-full" />
    </div>
  );
}
