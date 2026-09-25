import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, x as require_jsx_runtime, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-D95E_PuI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BpEQtQRc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("up");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onEmail(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			if (mode === "up") {
				const res = await authClient.signUp.email({
					email,
					password,
					name: name || email
				});
				if (res.error) throw new Error(res.error.message);
			} else {
				const res = await authClient.signIn.email({
					email,
					password
				});
				if (res.error) throw new Error(res.error.message);
			}
			await navigate({ to: "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "No se pudo entrar.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "studio login-screen",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "login-card",
			onSubmit: onEmail,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "studio-mark",
					children: "SYNC ENGINE"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: mode === "up" ? "Crear cuenta" : "Entrar" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "studio-lead",
					children: "Tu galería y tus diseños quedan en esta cuenta."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: ["Nombre", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							onChange: (ev) => setName(ev.target.value),
							autoComplete: "name"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: ["Correo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							required: true,
							value: email,
							onChange: (ev) => setEmail(ev.target.value),
							autoComplete: "email"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: ["Contraseña", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							required: true,
							minLength: 8,
							value: password,
							onChange: (ev) => setPassword(ev.target.value),
							autoComplete: mode === "up" ? "new-password" : "current-password"
						})]
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "studio-error",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "studio-go",
						disabled: busy,
						children: busy ? "Un momento…" : mode === "up" ? "Registrarme" : "Entrar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "login-switch",
						onClick: () => setMode(mode === "up" ? "in" : "up"),
						children: mode === "up" ? "Ya tengo cuenta" : "Crear una cuenta"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "login-or",
						children: "o"
					}),
					GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "login-social",
						onClick: () => signIn(p.providerId, { callbackURL: "/" }),
						children: ["Continuar con ", p.label]
					}, p.providerId))
				] })
			]
		})
	});
}
//#endregion
export { Login as component };
