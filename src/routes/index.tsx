import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HourScreen } from "@/components/studio/hour-piece";
import { Studio } from "@/components/studio/studio";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { user, isPending } = useCurrentUserState();
  const [studio, setStudio] = useState(false);

  if (isPending) {
    return (
      <div className="studio">
        <p className="studio-lead studio-pending">Cargando…</p>
      </div>
    );
  }

  if (user && studio) return <Studio onCompare={() => setStudio(false)} />;
  return <HourScreen signedIn={Boolean(user)} onStudio={() => setStudio(true)} />;
}