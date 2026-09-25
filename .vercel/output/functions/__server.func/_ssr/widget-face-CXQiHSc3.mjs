import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { d as isAccent, f as isEffect, h as isSize, m as isMode, p as isFont, u as authMiddleware } from "./types-lVnHlw3Z.mjs";
import { i as BatteryMedium, n as RefreshCw, r as Infinity$1 } from "../_libs/lucide-react.mjs";
import { n as format, t as es } from "../_libs/date-fns.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/widget-face-CXQiHSc3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listWidgets = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("00d90b5753780f2377a77035c7a246b593bdc9cf96afdfbc2b4fb7a03339e8de"));
var getWidget = createServerFn({ method: "GET" }).validator((id) => id).middleware([authMiddleware]).handler(createSsrRpc("ac827e45ae1cab7c475f9815a9713caf0980c93793f8044cbe8a31e15c340e2d"));
function parseDraft(input) {
	const name = input.name.trim().slice(0, 40);
	if (!name || !isMode(input.mode) || !isAccent(input.accent) || !isFont(input.font) || !isSize(input.size) || !isEffect(input.effect)) throw new Error("Diseño no válido");
	return {
		name,
		mode: input.mode,
		accent: input.accent,
		font: input.font,
		size: input.size,
		effect: input.effect
	};
}
var saveWidget = createServerFn({ method: "POST" }).validator((input) => parseDraft(input)).middleware([authMiddleware]).handler(createSsrRpc("6c8b0048744340c04685b829b0e0f76c97f0bcd864d0a3f9a07edaf9ec5aef87"));
var deleteWidget = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(createSsrRpc("fbeec3c66d3bd29ee886153a2c4e9396dfc9959eef02b62b8be44c0e213cb464"));
function useNow(intervalMs = 1e3) {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
	return now;
}
function useOnline() {
	const [online, setOnline] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const on = () => setOnline(true);
		const off = () => setOnline(false);
		setOnline(navigator.onLine);
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, []);
	return online;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function WidgetFace({ config, className }) {
	const now = useNow(1e3);
	const online = useOnline();
	const [battery, setBattery] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const nav = navigator;
		if (!nav.getBattery) return;
		let alive = true;
		nav.getBattery().then((bat) => {
			if (alive) setBattery(Math.round(bat.level * 100));
		}).catch(() => {});
		return () => {
			alive = false;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: cn("face", `face-${config.size}`, `face-font-${config.font}`, `face-fx-${config.effect}`, className),
		"data-accent": config.accent,
		children: [
			config.mode === "analog" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Analog, { now }) : null,
			config.mode === "digital" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Digital, { now }) : null,
			config.mode === "status" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, {
				now,
				online,
				battery
			}) : null,
			config.mode === "split" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Split, { now }) : null,
			config.mode !== "split" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {}) : null
		]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "face-foot",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "face-brand",
			children: "SYNC ENGINE"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "face-by",
			children: "by Barrantes Co."
		})]
	});
}
function Analog({ now }) {
	const s = now.getSeconds();
	const m = now.getMinutes();
	const h = now.getHours() % 12;
	const sec = s * 6;
	const min = m * 6 + s * .1;
	const hour = h * 30 + m * .5;
	const ticks = Array.from({ length: 60 }, (_, i) => i);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "face-analog",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 200 200",
			className: "face-dial",
			"aria-hidden": "true",
			children: [
				ticks.map((i) => {
					const major = i % 5 === 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "100",
						y1: major ? 14 : 16,
						x2: "100",
						y2: major ? 24 : 20,
						className: major ? "tick-major" : "tick-minor",
						transform: `rotate(${i * 6} 100 100)`
					}, i);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "100",
					y1: "108",
					x2: "100",
					y2: "58",
					className: "hand",
					strokeWidth: "3",
					transform: `rotate(${hour} 100 100)`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "100",
					y1: "112",
					x2: "100",
					y2: "36",
					className: "hand",
					strokeWidth: "2.5",
					transform: `rotate(${min} 100 100)`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: "100",
					y1: "118",
					x2: "100",
					y2: "28",
					className: "hand-sec",
					transform: `rotate(${sec} 100 100)`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "100",
					cy: "100",
					r: "4",
					className: "hand-cap"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Infinity$1, {
			className: "dial-mark",
			"aria-hidden": "true"
		})]
	});
}
function Digital({ now }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "face-stack",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "face-time",
			suppressHydrationWarning: true,
			children: format(now, "HH:mm")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "face-sub",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				suppressHydrationWarning: true,
				children: format(now, "HH:mm:ss")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				suppressHydrationWarning: true,
				children: format(now, "d MMM, yy", { locale: es })
			})]
		})]
	});
}
function Status({ now, online, battery }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "face-stack",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "face-time",
			suppressHydrationWarning: true,
			children: format(now, "HH:mm")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "face-meta",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BatteryMedium, {
					className: "face-ico",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: battery == null ? "—" : `${battery}%` }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {
					className: "face-ico",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: online ? "Sync" : "Sin red" })
			]
		})]
	});
}
function Split({ now }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "face-split",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "face-split-nums",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				suppressHydrationWarning: true,
				children: format(now, "HH")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "face-split-min",
				suppressHydrationWarning: true,
				children: format(now, "mm")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "face-split-side",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					suppressHydrationWarning: true,
					children: format(now, "d MMM, yyyy", { locale: es })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "face-brand",
					children: "SYNC ENGINE"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "face-by",
					children: "by Barrantes Co."
				})
			]
		})]
	});
}
//#endregion
export { listWidgets as a, getWidget as i, cn as n, saveWidget as o, deleteWidget as r, WidgetFace as t };
