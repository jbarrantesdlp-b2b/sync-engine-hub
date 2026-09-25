import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { WidgetFace } from "@/components/studio/widget-face";
import { getWidget } from "@/lib/widgets/api";
import type { SavedWidget } from "@/lib/widgets/types";

export const Route = createFileRoute("/widget/$id")({ component: WidgetScreen });

function WidgetScreen() {
  const { id } = Route.useParams();
  const [widget, setWidget] = useState<SavedWidget | null | undefined>(undefined);

  useEffect(() => {
    getWidget({ data: id })
      .then(setWidget)
      .catch(() => setWidget(null));
  }, [id]);

  return (
    <div className="place-screen">
      {widget ? <WidgetFace config={widget} /> : null}
      {widget === null ? <p className="studio-lead">Ese diseño no está en tu cuenta.</p> : null}
      {widget === undefined ? <p className="studio-lead">Cargando…</p> : null}
      <Link to="/" className="place-back">
        Volver al estudio
      </Link>
    </div>
  );
}
