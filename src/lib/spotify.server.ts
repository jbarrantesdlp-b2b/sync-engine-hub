import { env } from "@/lib/env.server";

const AUTH = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const API = "https://api.spotify.com/v1";
const SCOPES = "user-read-playback-state user-modify-playback-state user-read-currently-playing";

export type SpotifyPlayer = {
  configured: boolean;
  connected: boolean;
  playing: boolean;
  title: string | null;
  artist: string | null;
  art: string | null;
  progressMs: number;
  durationMs: number;
  error?: string;
};

const EMPTY: SpotifyPlayer = {
  configured: false,
  connected: false,
  playing: false,
  title: null,
  artist: null,
  art: null,
  progressMs: 0,
  durationMs: 0,
};

export function spotifyConfigured() {
  return Boolean(env("SPOTIFY_CLIENT_ID"));
}

function cookies(request: Request) {
  const out = new Map<string, string>();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out.set(part.slice(0, i).trim(), decodeURIComponent(part.slice(i + 1).trim()));
  }
  return out;
}

function b64url(bytes: Uint8Array) {
  let raw = "";
  for (const byte of bytes) raw += String.fromCharCode(byte);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function codeChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return b64url(new Uint8Array(digest));
}

export function randomKey() {
  return b64url(crypto.getRandomValues(new Uint8Array(32)));
}

function cookie(name: string, value: string, maxAge: number, secure: boolean) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/api/spotify",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
const inflight = new Map<string, Promise<{ access_token: string; refresh_token?: string; expires_in: number } | null>>();

function clampExpiry(expiresIn: number) {
  const seconds = Number(expiresIn);
  if (!Number.isFinite(seconds)) return 3600;
  return Math.max(30, Math.min(60 * 60 * 24, Math.floor(seconds)));
}

export function clearSpotifyCookies(secure: boolean) {
  return ["spotify_access", "spotify_refresh", "spotify_exp", "spotify_state", "spotify_verifier"].map((name) =>
    cookie(name, "", 0, secure),
  );
}

export function loginCookies(state: string, verifier: string, secure: boolean) {
  return [cookie("spotify_state", state, 600, secure), cookie("spotify_verifier", verifier, 600, secure)];
}

export function tokenCookies(access: string, refresh: string, expiresIn: number, secure: boolean) {
  const seconds = clampExpiry(expiresIn);
  return [
    cookie("spotify_access", access, seconds, secure),
    cookie("spotify_exp", String(Date.now() + seconds * 1000), REFRESH_MAX_AGE, secure),
    cookie("spotify_refresh", refresh, REFRESH_MAX_AGE, secure),
    cookie("spotify_state", "", 0, secure),
    cookie("spotify_verifier", "", 0, secure),
  ];
}

export function sameSecret(left: string, right: string) {
  if (!left || !right || left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

export function authorizeUrl(origin: string, state: string, challenge: string) {
  const url = new URL(AUTH);
  url.searchParams.set("client_id", env("SPOTIFY_CLIENT_ID") ?? "");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${origin}/api/spotify/callback`);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);
  return url.toString();
}

async function tokenRequest(body: URLSearchParams) {
  const id = env("SPOTIFY_CLIENT_ID");
  const secret = env("SPOTIFY_CLIENT_SECRET");
  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  if (id && secret) headers.Authorization = `Basic ${btoa(`${id}:${secret}`)}`;
  else if (id) body.set("client_id", id);
  const res = await fetch(TOKEN, { method: "POST", headers, body });
  if (!res.ok) return null;
  return (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };
}

export async function exchangeCode(code: string, verifier: string, origin: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: `${origin}/api/spotify/callback`,
    code_verifier: verifier,
  });
  return tokenRequest(body);
}

async function refreshOnce(refresh: string) {
  const pending = inflight.get(refresh);
  if (pending) return pending;
  const job = tokenRequest(new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh })).finally(() => {
    inflight.delete(refresh);
  });
  inflight.set(refresh, job);
  return job;
}

export type TokenSession = {
  token: string | null;
  refresh: string | null;
  cookies: string[];
  dead: boolean;
};

export async function refreshSession(refresh: string, secure: boolean): Promise<TokenSession> {
  const next = await refreshOnce(refresh);
  if (!next) return { token: null, refresh, cookies: [], dead: true };
  const kept = next.refresh_token || refresh;
  return {
    token: next.access_token,
    refresh: kept,
    cookies: tokenCookies(next.access_token, kept, next.expires_in, secure),
    dead: false,
  };
}

export async function accessToken(request: Request, secure: boolean, force = false): Promise<TokenSession> {
  const stored = cookies(request);
  const refresh = stored.get("spotify_refresh") ?? null;
  const access = stored.get("spotify_access");
  const exp = Number(stored.get("spotify_exp") ?? 0);
  if (!force && access && refresh && exp - 30_000 > Date.now()) {
    return { token: access, refresh, cookies: [], dead: false };
  }
  if (!refresh) return { token: null, refresh: null, cookies: [], dead: false };
  return refreshSession(refresh, secure);
}

function artOf(images: { url?: string }[] | undefined) {
  const url = images?.find((image) => image.url?.startsWith("https://i.scdn.co/"))?.url ?? null;
  return url;
}

export async function readPlayer(token: string): Promise<SpotifyPlayer> {
  const res = await fetch(`${API}/me/player`, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 204) {
    return { ...EMPTY, configured: true, connected: true };
  }
  if (res.status === 401) return { ...EMPTY, configured: true, connected: false, error: "unauthorized" };
  const data = (await res.json()) as {
    is_playing?: boolean;
    progress_ms?: number;
    item?: {
      name?: string;
      duration_ms?: number;
      artists?: { name?: string }[];
      album?: { images?: { url?: string }[] };
      show?: { name?: string };
      images?: { url?: string }[];
    };
  };
  const item = data.item;
  const artist =
    item?.artists?.map((person) => person.name).filter(Boolean).join(", ") || item?.show?.name || null;
  return {
    configured: true,
    connected: true,
    playing: Boolean(data.is_playing),
    title: item?.name ?? null,
    artist,
    art: artOf(item?.album?.images ?? item?.images),
    progressMs: data.progress_ms ?? 0,
    durationMs: item?.duration_ms ?? 0,
  };
}

export async function sendCommand(token: string, action: string) {
  const map: Record<string, { method: string; path: string }> = {
    play: { method: "PUT", path: "/me/player/play" },
    pause: { method: "PUT", path: "/me/player/pause" },
    next: { method: "POST", path: "/me/player/next" },
    previous: { method: "POST", path: "/me/player/previous" },
  };
  const command = map[action];
  if (!command) return { ok: false, error: "accion" };
  const res = await fetch(`${API}${command.path}`, {
    method: command.method,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return { ok: false, error: "sin-dispositivo" };
  return { ok: res.ok || res.status === 204, error: res.ok || res.status === 204 ? undefined : "spotify" };
}

export function jar(request: Request) {
  return cookies(request);
}
