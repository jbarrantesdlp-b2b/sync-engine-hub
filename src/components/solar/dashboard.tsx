import { LogoMark } from "@/components/logo";
import { SolarHomeGrid } from "@/components/solar/home-grid";
import { cn } from "@/lib/utils";

export function SolarDashboard() {
  return (
    <div className="min-h-full bg-oled px-6 py-8 text-solar-fg">
      <header className="flex items-center gap-3">
        <LogoMark className="size-10" />
        <div>
          <p className="text-sm font-semibold tracking-tight">SYNC ENGINE</p>
          <p className="text-[11px] tracking-[0.16em] text-solar">by Barrantes Co.</p>
        </div>
      </header>
      <SolarHomeGrid className="mx-auto mt-8 max-w-[720px] gap-5" />
    </div>
  );
}

export function SolarMobileHome() {
  return (
    <div className={cn("min-h-full bg-oled px-4 pb-8 pt-5 text-solar-fg")}>
      <SolarHomeGrid className="mx-auto mt-6 max-w-[420px]" />
    </div>
  );
}
