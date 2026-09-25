import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useNow } from "@/hooks/use-now";
import { PRESETS } from "@/lib/widgets/types";
import { WidgetFace } from "@/components/studio/widget-face";

export function Compare({
  signedIn,
  onStudio,
}: {
  signedIn: boolean;
  onStudio: () => void;
}) {
  return (
    <div className="studio compare">
      <header className="studio-bar">
        <div>
          <p className="studio-mark">SYNC ENGINE</p>
          <p className="studio-kicker">Comparativo</p>
        </div>
        {signedIn ? (
          <button type="button" className="studio-go studio-go-inline" onClick={onStudio}>
            Estudio
          </button>
        ) : (
          <Link to="/login" className="studio-go studio-go-inline">
            Crear cuenta
          </Link>
        )}
      </header>

      <section className="compare-intro">
        <h1>Tres tableros. Sin reloj.</h1>
        <p>
          El reloj sigue en 2×2 o 3×3. Volumen, brillo, audio y agenda no caben en ese cuadrado:
          van en un tablero que ocupa el 50%, el 25% o el 10% de la pantalla. Los controles llenan esa medida.
          Si el usuario agranda o achica el tablero, los controles crecen con él.
        </p>
      </section>

      <section className="boards" aria-label="Tres magnitudes de tablero">
        <Board label="50% de la pantalla" note="Audio, volumen, brillo y agenda.">
          <Dash50 />
        </Board>
        <Board label="25% de la pantalla" note="Audio arriba. Volumen y brillo abajo.">
          <Dash25 />
        </Board>
        <Board label="10% de la pantalla" note="Una sola fila. Los tres controles, a lo ancho.">
          <Dash10 />
        </Board>
      </section>

      <Pair
        title="Reloj"
        market="Facer, WatchMaker, KWGT"
        marketNote="La hora queda pequeña. El resto del widget es aire."
        ours="La hora ocupa la pieza."
      >
        <MarketClock />
        <WidgetFace config={{ ...PRESETS[1], size: "m" }} />
      </Pair>

      <Pair
        title="Hora y clima"
        market="Widgets de clima"
        marketNote="Un número suelto. Si no hay dato, inventan uno."
        ours="La hora y la temperatura llenan el marco. Sin dato, queda vacío."
      >
        <MarketWeather />
        <WeatherFace />
      </Pair>

      <Pair
        title="Música"
        market="Widget de Spotify"
        marketNote="Solo sirve para esa app. No comparte marco con el resto."
        ours="Play, pausa y siguiente, sobre la sesión de audio del teléfono."
      >
        <MarketMusic />
        <MusicFace />
      </Pair>

      <Pair
        title="Volumen"
        market="Ajuste del sistema"
        marketNote="Una barra fina, fuera de tu interfaz."
        ours="La barra es el widget. Se mueve y escala con la pieza."
      >
        <MarketSlider label="Vol" />
        <SliderFace kind="volume" />
      </Pair>

      <Pair
        title="Brillo"
        market="Ajuste del sistema"
        marketNote="El mismo control, otra pantalla, otro dibujo."
        ours="La misma barra. Otro dato: la luz de la pantalla."
      >
        <MarketSlider label="Luz" />
        <SliderFace kind="light" />
      </Pair>

      <Pair
        title="Agenda"
        market="Calendario de Android"
        marketNote="Una lista. No es parte de la familia."
        ours="El próximo evento, o nada, si el calendario no entregó uno."
      >
        <MarketList />
        <AgendaFace />
      </Pair>

      <Pair
        title="Asistentes"
        market="ChatGPT, Gemini, Grok"
        marketNote="No tienen widget de control. Solo el icono de la app."
        ours="Tres accesos en el mismo marco. Abren la app. El chat no cabe aquí."
      >
        <MarketApps />
        <AssistFace />
      </Pair>

      <p className="studio-lead compare-foot">
        Mañana se suma otro control sin cambiar la interfaz: entra al mismo marco.
        En el teléfono, la música usa la sesión de audio. Clima, agenda y asistentes muestran el dato real o abren la app.
      </p>
    </div>
  );
}

function Board({ label, note, children }: { label: string; note: string; children: ReactNode }) {
  return (
    <div className="board">
      <p className="pair-who pair-who-ours">{label}</p>
      <div className="screen">
        <div className="screen-body">{children}</div>
      </div>
      <p className="pair-note">{note}</p>
    </div>
  );
}

function Dash50() {
  const [vol, setVol] = useState(62);
  const [light, setLight] = useState(40);
  const [playing, setPlaying] = useState(false);
  return (
    <article className="dash dash-50">
      <div className="dash-row">
        <div className="dash-copy">
          <p className="dash-kicker">Audio</p>
          <p className="dash-title">{playing ? "En reproducción" : "Sin sesión"}</p>
        </div>
        <button type="button" className="dash-play" aria-label={playing ? "Pausa" : "Reproducir"} onClick={() => setPlaying((v) => !v)}>
          {playing ? <Pause /> : <Play />}
        </button>
      </div>
      <Bar label="Volumen" value={vol} onChange={setVol} />
      <Bar label="Brillo" value={light} onChange={setLight} />
      <div className="dash-row">
        <div className="dash-copy">
          <p className="dash-kicker">Agenda</p>
          <p className="dash-title">—</p>
        </div>
        <p className="dash-kicker">Sin evento</p>
      </div>
    </article>
  );
}

function Dash25() {
  const [vol, setVol] = useState(62);
  const [light, setLight] = useState(40);
  const [playing, setPlaying] = useState(false);
  return (
    <article className="dash dash-25">
      <div className="dash-row">
        <button type="button" className="dash-play dash-play-s" aria-label={playing ? "Pausa" : "Reproducir"} onClick={() => setPlaying((v) => !v)}>
          {playing ? <Pause /> : <Play />}
        </button>
        <p className="dash-title">{playing ? "En reproducción" : "Sin sesión"}</p>
      </div>
      <div className="dash-split">
        <Bar label="Volumen" value={vol} onChange={setVol} />
        <Bar label="Brillo" value={light} onChange={setLight} />
      </div>
    </article>
  );
}

function Dash10() {
  const [vol, setVol] = useState(62);
  const [light, setLight] = useState(40);
  const [playing, setPlaying] = useState(false);
  return (
    <article className="dash dash-10">
      <button type="button" className="dash-play dash-play-s" aria-label={playing ? "Pausa" : "Reproducir"} onClick={() => setPlaying((v) => !v)}>
        {playing ? <Pause /> : <Play />}
      </button>
      <input className="dash-range" type="range" min={0} max={100} value={vol} aria-label="Volumen" onChange={(e) => setVol(Number(e.target.value))} />
      <input className="dash-range" type="range" min={0} max={100} value={light} aria-label="Brillo" onChange={(e) => setLight(Number(e.target.value))} />
    </article>
  );
}

function Bar({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="dash-row">
      <span className="dash-kicker">{label}</span>
      <input className="dash-range" type="range" min={0} max={100} value={value} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} />
      <b className="dash-num">{value}</b>
    </label>
  );
}

function Pair({
  title,
  market,
  marketNote,
  ours,
  children,
}: {
  title: string;
  market: string;
  marketNote: string;
  ours: string;
  children: [ReactNode, ReactNode];
}) {
  return (
    <section className="pair">
      <h2>{title}</h2>
      <div className="pair-grid">
        <div className="pair-side">
          <p className="pair-who">Hoy · {market}</p>
          <div className="market">{children[0]}</div>
          <p className="pair-note">{marketNote}</p>
        </div>
        <div className="pair-side">
          <p className="pair-who pair-who-ours">Sync Engine</p>
          <div className="studio-stage">{children[1]}</div>
          <p className="pair-note">{ours}</p>
        </div>
      </div>
    </section>
  );
}

function MarketClock() {
  return (
    <div className="market-card">
      <span>09:41</span>
    </div>
  );
}

function MarketWeather() {
  return (
    <div className="market-card">
      <span>22°</span>
    </div>
  );
}

function MarketMusic() {
  return (
    <div className="market-card market-card-row">
      <Play className="face-ico" aria-hidden="true" />
      <span>Canción</span>
    </div>
  );
}

function MarketSlider({ label }: { label: string }) {
  return (
    <div className="market-card">
      <span>{label}</span>
      <i className="market-line" />
    </div>
  );
}

function MarketList() {
  return (
    <div className="market-card market-card-list">
      <span>Reunión</span>
      <span>Reunión</span>
      <span>Reunión</span>
    </div>
  );
}

function MarketApps() {
  return (
    <div className="market-apps">
      <span>GPT</span>
      <span>Gem</span>
      <span>Grok</span>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="face-frame face-frame-m">
      <article className="face face-master face-fx-glow" data-accent="cyan">
        {children}
      </article>
    </div>
  );
}

function WeatherFace() {
  const now = useNow(1000);
  return (
    <Shell>
      <div className="face-stack">
        <p className="face-time" suppressHydrationWarning>
          {format(now, "HH:mm")}
        </p>
        <p className="ctrl-metric">—</p>
        <p className="ctrl-label">Temperatura</p>
      </div>
    </Shell>
  );
}

function MusicFace() {
  const [playing, setPlaying] = useState(false);
  return (
    <Shell>
      <div className="face-stack ctrl-music">
        <p className="ctrl-track">{playing ? "En reproducción" : "Sin sesión"}</p>
        <p className="ctrl-label">Audio del teléfono</p>
        <div className="ctrl-transport">
          <button type="button" aria-label="Anterior">
            <SkipBack />
          </button>
          <button type="button" className="ctrl-play" aria-label={playing ? "Pausa" : "Reproducir"} onClick={() => setPlaying((v) => !v)}>
            {playing ? <Pause /> : <Play />}
          </button>
          <button type="button" aria-label="Siguiente">
            <SkipForward />
          </button>
        </div>
      </div>
    </Shell>
  );
}

function SliderFace({ kind }: { kind: "volume" | "light" }) {
  const [value, setValue] = useState(kind === "volume" ? 62 : 40);
  const label = kind === "volume" ? "Volumen" : "Brillo";
  return (
    <Shell>
      <div className="face-stack ctrl-slider">
        <p className="ctrl-label">{label}</p>
        <p className="ctrl-metric">{value}</p>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          aria-label={label}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>
    </Shell>
  );
}

function AgendaFace() {
  return (
    <Shell>
      <div className="face-stack">
        <p className="ctrl-label">Agenda</p>
        <p className="ctrl-metric">—</p>
        <p className="ctrl-label">Sin evento</p>
      </div>
    </Shell>
  );
}

function AssistFace() {
  const apps = ["Grok", "Gemini", "ChatGPT"];
  return (
    <Shell>
      <div className="ctrl-apps">
        {apps.map((name) => (
          <button key={name} type="button">
            {name}
          </button>
        ))}
      </div>
    </Shell>
  );
}
