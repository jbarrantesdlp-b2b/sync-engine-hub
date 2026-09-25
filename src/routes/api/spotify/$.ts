import { createFileRoute } from "@tanstack/react-router";
import {
  accessToken,
  authorizeUrl,
  clearSpotifyCookies,
  codeChallenge,
  exchangeCode,
  jar,
  loginCookies,
  randomKey,
  readPlayer,
  refreshSession,
  sameSecret,
  sendCommand,
  spotifyConfigured,
  tokenCookies,
} from "@/lib/spotify.server";

function secure(request: Request) {
  return new URL(request.url).protocol === "https:";
}

function withCookies(response: Response, cookies: string[]) {
  for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
  return response;
}

export const Route = createFileRoute("/api/spotify/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const part = params._splat ?? "";
        const origin = new URL(request.url).origin;
        const https = secure(request);
        if (part === "login") {
          if (!spotifyConfigured()) return new Response("Falta SPOTIFY_CLIENT_ID", { status: 503 });
          const state = randomKey();
          const verifier = randomKey();
          const challenge = await codeChallenge(verifier);
          return withCookies(Response.redirect(authorizeUrl(origin, state, challenge), 302), loginCookies(state, verifier, https));
        }
        if (part === "callback") {
          const url = new URL(request.url);
          const cookies = jar(request);
          if (!url.searchParams.get("code") || !sameSecret(url.searchParams.get("state") ?? "", cookies.get("spotify_state") ?? "")) {
            return withCookies(Response.redirect(`${origin}/`, 302), clearSpotifyCookies(https));
          }
          const tokens = await exchangeCode(
            url.searchParams.get("code") ?? "",
            cookies.get("spotify_verifier") ?? "",
            origin,
          );
          if (!tokens?.refresh_token) return withCookies(Response.redirect(`${origin}/`, 302), clearSpotifyCookies(https));
          return withCookies(
            Response.redirect(`${origin}/`, 302),
            tokenCookies(tokens.access_token, tokens.refresh_token, tokens.expires_in, https),
          );
        }
        if (part === "logout") {
          return withCookies(Response.redirect(`${origin}/`, 302), clearSpotifyCookies(https));
        }
        if (part === "player") {
          const idle = { configured: true, connected: false, playing: false, title: null, artist: null, art: null, progressMs: 0, durationMs: 0 };
          if (!spotifyConfigured()) return Response.json({ ...idle, configured: false });
          let session = await accessToken(request, https);
          if (!session.token || session.dead) {
            const response = Response.json(idle);
            return session.dead ? withCookies(response, clearSpotifyCookies(https)) : response;
          }
          let player = await readPlayer(session.token);
          if (player.error === "unauthorized" && session.refresh) {
            session = await refreshSession(session.refresh, https);
            if (!session.token || session.dead) {
              return withCookies(Response.json(idle), clearSpotifyCookies(https));
            }
            player = await readPlayer(session.token);
          }
          const response = Response.json(player.error === "unauthorized" ? idle : player);
          return session.cookies.length ? withCookies(response, session.cookies) : response;
        }
        return new Response("No encontrado", { status: 404 });
      },
      POST: async ({ request, params }) => {
        if ((params._splat ?? "") !== "player") return new Response("No encontrado", { status: 404 });
        if (!spotifyConfigured()) return Response.json({ ok: false, error: "sin-configurar" }, { status: 503 });
        const session = await accessToken(request, secure(request));
        if (!session.token || session.dead) {
          const response = Response.json({ ok: false, error: "sin-sesion" }, { status: 401 });
          return session.dead ? withCookies(response, clearSpotifyCookies(secure(request))) : response;
        }
        const body = (await request.json().catch(() => null)) as { action?: string } | null;
        const result = await sendCommand(session.token, body?.action ?? "");
        const response = Response.json(result, { status: result.ok ? 200 : 409 });
        return session.cookies.length ? withCookies(response, session.cookies) : response;
      },
    },
  },
});
