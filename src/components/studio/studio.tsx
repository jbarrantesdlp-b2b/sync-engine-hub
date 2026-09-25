import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { deleteWidget, listWidgets, saveWidget } from "@/lib/widgets/api";
import {
  ACCENTS,
  EFFECT_LABEL,
  EFFECTS,
  FONT_LABEL,
  FONTS,
  MODE_LABEL,
  PRESETS,
  SIZE_LABEL,
  SIZES,
  SLOT_LABEL,
  SLOTS,
  type SavedWidget,
  type WidgetConfig,
} from "@/lib/widgets/types";
import { WidgetFace } from "@/components/studio/widget-face";
import { cn } from "@/lib/utils";

const EMPTY: WidgetConfig = PRESETS[1];
const FREE_SAVES = 1;

export function Studio({ onCompare }: { onCompare?: () => void }) {
  const [draft, setDraft] = useState<WidgetConfig>(EMPTY);
  const [name, setName] = useState("Mi reloj");
  const [saved, setSaved] = useState<SavedWidget[]>([]);
  const [placed, setPlaced] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [offer, setOffer] = useState(false);

  async function refresh() {
    const rows = await listWidgets();
    setSaved(rows);
  }

  useEffect(() => {
    refresh().catch(() => setError("No se pudieron cargar tus diseños."));
  }, []);

  async function onSave() {
    if (saved.length >= FREE_SAVES) {
      setOffer(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { id } = await saveWidget({ data: { name, ...draft } });
      await refresh();
      setPlaced(id);
    } catch {
      setError("No se pudo guardar. Entra de nuevo e inténtalo.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    await deleteWidget({ data: id });
    if (placed === id) setPlaced(null);
    await refresh();
  }

  return (
    <div className="studio">
      <header className="studio-bar">
        <div>
          <p className="studio-mark">SYNC ENGINE</p>
          <p className="studio-kicker">Estudio</p>
        </div>
        <div className="studio-bar-end">
          {onCompare ? (
            <button type="button" className="price-chip" onClick={onCompare}>
              Reloj
            </button>
          ) : null}
          <button type="button" className="price-chip" onClick={() => setOffer(true)}>
            Studio S/ 19.90
          </button>
          <UserButton />
        </div>
      </header>

      <div className="studio-work">
        <section className="studio-stage">
          <WidgetFace config={draft} />
          {placed ? <PlaceNote id={placed} /> : null}
        </section>

        <section className="studio-panel">
          <h1 className="studio-title">El reloj ocupa el widget</h1>
          <p className="studio-lead">
            Al cambiar el tamaño se escala entero: hora, dato y marca, en la misma proporción.
          </p>

          <div className="preset-row">
            {PRESETS.map((preset) => (
              <button
                key={preset.mode}
                type="button"
                className={cn("preset", draft.mode === preset.mode && "is-on")}
                onClick={() => {
                  setDraft({ ...preset, size: draft.size, accent: draft.accent, font: draft.font, effect: draft.effect, slot: draft.slot });
                  setName(preset.name);
                  setPlaced(null);
                }}
              >
                <WidgetFace config={preset} frame="thumb" />
                <span>{MODE_LABEL[preset.mode]}</span>
              </button>
            ))}
          </div>

          <label className="field">
            Nombre
            <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          </label>

          <div className="choice-grid">
            <Choice
              label="Color"
              value={draft.accent}
              options={ACCENTS.map((id) => ({ id, label: id === "cyan" ? "Cian" : "Ámbar" }))}
              onChange={(accent) => setDraft({ ...draft, accent })}
            />
            <Choice
              label="Tipo de letra"
              value={draft.font}
              options={FONTS.map((id) => ({ id, label: FONT_LABEL[id] }))}
              onChange={(font) => setDraft({ ...draft, font })}
            />
            <Choice
              label="Tamaño"
              value={draft.size}
              options={SIZES.map((id) => ({ id, label: SIZE_LABEL[id] }))}
              onChange={(size) => setDraft({ ...draft, size })}
            />
            <Choice
              label="Efecto"
              value={draft.effect}
              options={EFFECTS.map((id) => ({ id, label: EFFECT_LABEL[id] }))}
              onChange={(effect) => setDraft({ ...draft, effect })}
            />
            <Choice
              label="Complicación"
              value={draft.slot}
              options={SLOTS.map((id) => ({ id, label: SLOT_LABEL[id] }))}
              onChange={(slot) => setDraft({ ...draft, slot })}
            />
          </div>

          {error ? <p className="studio-error">{error}</p> : null}
          <button type="button" className="studio-go" disabled={busy || !name.trim()} onClick={onSave}>
            {busy ? "Guardando…" : saved.length >= FREE_SAVES ? "Guardar con Studio" : "Guardar y colocar"}
          </button>
          <p className="studio-lead">Gratis: {FREE_SAVES} diseño. Studio: ilimitados, S/ 19.90 una vez.</p>
        </section>
      </div>

      <section className="studio-library">
        <h2>Mis diseños</h2>
        {saved.length === 0 ? (
          <p className="studio-lead">Todavía no hay ninguno guardado.</p>
        ) : (
          <ul>
            {saved.map((item) => (
              <li key={item.id}>
                <button type="button" className="lib-open" onClick={() => { setDraft(item); setName(item.name); setPlaced(item.id); }}>
                  <WidgetFace config={item} frame="thumb" />
                  <span>{item.name}</span>
                </button>
                <button type="button" className="lib-del" onClick={() => onDelete(item.id)}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {offer ? <Offer onClose={() => setOffer(false)} /> : null}
    </div>
  );
}

function Offer({ onClose }: { onClose: () => void }) {
  return (
    <div className="offer" role="dialog" aria-modal="true" aria-labelledby="offer-title">
      <div className="offer-card">
        <p className="studio-mark">STUDIO</p>
        <h2 id="offer-title">S/ 19.90, una vez</h2>
        <p className="studio-lead">Como un desbloqueo de KWGT, no una renta mensual.</p>
        <ul className="offer-list">
          <li>Diseños ilimitados en tu cuenta</li>
          <li>Los cuatro relojes, cian y ámbar</li>
          <li>Efecto Energía y las complicaciones</li>
        </ul>
        <p className="studio-lead">El cobro se conecta al publicar en Play. Aquí el precio ya está cerrado.</p>
        <button type="button" className="studio-go" onClick={onClose}>
          Seguir con el gratis
        </button>
      </div>
    </div>
  );
}

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (id: T) => void;
}) {
  return (
    <div className="choice">
      <p>{label}</p>
      <div>
        {options.map((opt) => (
          <button key={opt.id} type="button" className={cn(value === opt.id && "is-on")} onClick={() => onChange(opt.id)}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlaceNote({ id }: { id: string }) {
  return (
    <div className="place-note">
      <p>Diseño guardado. En el teléfono: mantén pulsado el escritorio, Widgets, Sync Engine.</p>
      <Link to="/widget/$id" params={{ id }}>
        Ver en la pantalla
      </Link>
    </div>
  );
}
