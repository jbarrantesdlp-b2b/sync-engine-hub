import { o as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$1 } from "./router-DGhjyWQP.mjs";
import { i as getWidget, t as WidgetFace } from "./widget-face-CXQiHSc3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/widget._id-BMyumG8H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WidgetScreen() {
	const { id } = Route$1.useParams();
	const [widget, setWidget] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		getWidget({ data: id }).then(setWidget).catch(() => setWidget(null));
	}, [id]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "place-screen",
		children: [
			widget ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetFace, { config: widget }) : null,
			widget === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "studio-lead",
				children: "Ese diseño no está en tu cuenta."
			}) : null,
			widget === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "studio-lead",
				children: "Cargando…"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "place-back",
				children: "Volver al estudio"
			})
		]
	});
}
//#endregion
export { WidgetScreen as component };
