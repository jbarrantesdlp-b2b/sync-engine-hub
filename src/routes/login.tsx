import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({ email, password, name: name || email });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      }
      await navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="studio login-screen">
      <form className="login-card" onSubmit={onEmail}>
        <p className="studio-mark">SYNC ENGINE</p>
        <h1>{mode === "up" ? "Crear cuenta" : "Entrar"}</h1>
        <p className="studio-lead">Tu galería y tus diseños quedan en esta cuenta.</p>
        {authEnabled ? (
          <>
            {mode === "up" ? (
              <label className="field">
                Nombre
                <input value={name} onChange={(ev) => setName(ev.target.value)} autoComplete="name" />
              </label>
            ) : null}
            <label className="field">
              Correo
              <input type="email" required value={email} onChange={(ev) => setEmail(ev.target.value)} autoComplete="email" />
            </label>
            <label className="field">
              Contraseña
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
              />
            </label>
            {error ? <p className="studio-error">{error}</p> : null}
            <button type="submit" className="studio-go" disabled={busy}>
              {busy ? "Un momento…" : mode === "up" ? "Registrarme" : "Entrar"}
            </button>
            <button type="button" className="login-switch" onClick={() => setMode(mode === "up" ? "in" : "up")}>
              {mode === "up" ? "Ya tengo cuenta" : "Crear una cuenta"}
            </button>
            <div className="login-or">o</div>
            {GROK_PROVIDERS.map((p) => (
              <button key={p.providerId} type="button" className="login-social" onClick={() => signIn(p.providerId, { callbackURL: "/" })}>
                Continuar con {p.label}
              </button>
            ))}
          </>
        ) : (
          <p className="studio-lead">El registro está desactivado.</p>
        )}
      </form>
    </main>
  );
}
