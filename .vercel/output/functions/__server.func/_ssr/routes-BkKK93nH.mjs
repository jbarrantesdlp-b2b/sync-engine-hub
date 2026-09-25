import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as FONT_LABEL, c as SIZES, i as FONTS, l as SIZE_LABEL, n as EFFECTS, o as MODE_LABEL, r as EFFECT_LABEL, s as PRESETS, t as ACCENTS } from "./types-lVnHlw3Z.mjs";
import { i as signOut, t as authClient } from "./client-B40BzJxt.mjs";
import { a as hasGateSessionMarker } from "./server-D95E_PuI.mjs";
import { a as listWidgets, n as cn, o as saveWidget, r as deleteWidget, t as WidgetFace } from "./widget-face-CXQiHSc3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BkKK93nH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var EMPTY = PRESETS[1];
function Studio() {
	const [draft, setDraft] = (0, import_react.useState)(EMPTY);
	const [name, setName] = (0, import_react.useState)("Mi reloj");
	const [saved, setSaved] = (0, import_react.useState)([]);
	const [placed, setPlaced] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function refresh() {
		const rows = await listWidgets();
		setSaved(rows);
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => setError("No se pudieron cargar tus diseños."));
	}, []);
	async function onSave() {
		setBusy(true);
		setError(null);
		try {
			const { id } = await saveWidget({ data: {
				name,
				...draft
			} });
			await refresh();
			setPlaced(id);
		} catch {
			setError("No se pudo guardar. Entra de nuevo e inténtalo.");
		} finally {
			setBusy(false);
		}
	}
	async function onDelete(id) {
		await deleteWidget({ data: id });
		if (placed === id) setPlaced(null);
		await refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "studio",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "studio-bar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "studio-mark",
					children: "SYNC ENGINE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "studio-kicker",
					children: "Estudio de widgets"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "studio-stage",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetFace, { config: draft }), placed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceNote, { id: placed }) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "studio-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "studio-title",
						children: "Galería"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "studio-lead",
						children: "Elige un reloj y ajústalo. El diseño queda en tu cuenta."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "preset-row",
						children: PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: cn("preset", draft.mode === preset.mode && "is-on"),
							onClick: () => {
								setDraft(preset);
								setName(preset.name);
								setPlaced(null);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetFace, { config: {
								...preset,
								size: "s",
								effect: "plain"
							} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: MODE_LABEL[preset.mode] })]
						}, preset.mode))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: ["Nombre", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							maxLength: 40,
							onChange: (e) => setName(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						label: "Color",
						value: draft.accent,
						options: ACCENTS.map((id) => ({
							id,
							label: id === "cyan" ? "Cian" : "Ámbar"
						})),
						onChange: (accent) => setDraft({
							...draft,
							accent
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						label: "Tipo de letra",
						value: draft.font,
						options: FONTS.map((id) => ({
							id,
							label: FONT_LABEL[id]
						})),
						onChange: (font) => setDraft({
							...draft,
							font
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						label: "Tamaño",
						value: draft.size,
						options: SIZES.map((id) => ({
							id,
							label: SIZE_LABEL[id]
						})),
						onChange: (size) => setDraft({
							...draft,
							size
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						label: "Efecto",
						value: draft.effect,
						options: EFFECTS.map((id) => ({
							id,
							label: EFFECT_LABEL[id]
						})),
						onChange: (effect) => setDraft({
							...draft,
							effect
						})
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "studio-error",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "studio-go",
						disabled: busy || !name.trim(),
						onClick: onSave,
						children: busy ? "Guardando…" : "Guardar y colocar"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "studio-library",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Mis diseños" }), saved.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "studio-lead",
					children: "Todavía no hay ninguno guardado."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: saved.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "lib-open",
					onClick: () => {
						setDraft(item);
						setName(item.name);
						setPlaced(item.id);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetFace, { config: {
						...item,
						size: "s",
						effect: "plain"
					} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.name })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "lib-del",
					onClick: () => onDelete(item.id),
					children: "Quitar"
				})] }, item.id)) })]
			})
		]
	});
}
function Choice({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "choice",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: cn(value === opt.id && "is-on"),
			onClick: () => onChange(opt.id),
			children: opt.label
		}, opt.id)) })]
	});
}
function PlaceNote({ id }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "place-note",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Diseño guardado. En el teléfono: mantén pulsado el escritorio, entra en Widgets y elige Sync Engine." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/widget/$id",
			params: { id },
			children: "Ver en la pantalla"
		})]
	});
}
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "studio",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "studio-bar",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "studio-mark",
					children: "SYNC ENGINE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "studio-go studio-go-inline",
					children: "Crear cuenta"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "studio-hero",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Tus relojes, en tu pantalla." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Regístrate, elige un widget de la galería y cámbiale tamaño, letra, color y efecto. Luego colócalo en el inicio." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "landing-row",
				children: PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetFace, { config: {
					...preset,
					size: "s"
				} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", { children: MODE_LABEL[preset.mode] })] }, preset.mode))
			})
		]
	});
}
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "studio",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "studio-lead studio-pending",
			children: "Cargando tu estudio…"
		})
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {});
}
//#endregion
export { Home as component };
