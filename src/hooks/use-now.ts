import { useEffect, useState } from "react";

export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let frame = 0;
    let timer = 0;
    let stopped = false;

    const schedule = () => {
      const delay = Math.max(0, intervalMs - (Date.now() % intervalMs));
      timer = window.setTimeout(() => {
        frame = requestAnimationFrame(() => {
          if (stopped) return;
          setNow(new Date());
          schedule();
        });
      }, delay);
    };

    schedule();
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [intervalMs]);

  return now;
}
