import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DSFtteNG.mjs";
import { d as isAccent, f as isEffect, h as isSize, m as isMode, p as isFont, u as authMiddleware } from "./types-lVnHlw3Z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-c7kH_vbP.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function toSaved(row) {
	if (!isMode(row.mode) || !isAccent(row.accent) || !isFont(row.font) || !isSize(row.size) || !isEffect(row.effect)) return null;
	return {
		id: row.id,
		name: row.name,
		mode: row.mode,
		accent: row.accent,
		font: row.font,
		size: row.size,
		effect: row.effect
	};
}
var listWidgets_createServerFn_handler = createServerRpc({
	id: "00d90b5753780f2377a77035c7a246b593bdc9cf96afdfbc2b4fb7a03339e8de",
	name: "listWidgets",
	filename: "src/lib/widgets/api.ts"
}, (opts) => listWidgets.__executeServer(opts));
var listWidgets = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listWidgets_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, name, mode, accent, font, size, effect
      from saved_widgets
      where user_id = ${context.userId}
      order by created_at desc
    `).map(toSaved).filter((row) => row !== null);
});
var getWidget_createServerFn_handler = createServerRpc({
	id: "ac827e45ae1cab7c475f9815a9713caf0980c93793f8044cbe8a31e15c340e2d",
	name: "getWidget",
	filename: "src/lib/widgets/api.ts"
}, (opts) => getWidget.__executeServer(opts));
var getWidget = createServerFn({ method: "GET" }).validator((id) => id).middleware([authMiddleware]).handler(getWidget_createServerFn_handler, async ({ context, data: id }) => {
	const row = (await (await getSql())`
      select id, name, mode, accent, font, size, effect
      from saved_widgets
      where id = ${id} and user_id = ${context.userId}
    `)[0];
	return row ? toSaved(row) : null;
});
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
var saveWidget_createServerFn_handler = createServerRpc({
	id: "6c8b0048744340c04685b829b0e0f76c97f0bcd864d0a3f9a07edaf9ec5aef87",
	name: "saveWidget",
	filename: "src/lib/widgets/api.ts"
}, (opts) => saveWidget.__executeServer(opts));
var saveWidget = createServerFn({ method: "POST" }).validator((input) => parseDraft(input)).middleware([authMiddleware]).handler(saveWidget_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const id = crypto.randomUUID();
	await sql`
      insert into saved_widgets (id, user_id, name, mode, accent, font, size, effect)
      values (${id}, ${context.userId}, ${data.name}, ${data.mode}, ${data.accent}, ${data.font}, ${data.size}, ${data.effect})
    `;
	return { id };
});
var deleteWidget_createServerFn_handler = createServerRpc({
	id: "fbeec3c66d3bd29ee886153a2c4e9396dfc9959eef02b62b8be44c0e213cb464",
	name: "deleteWidget",
	filename: "src/lib/widgets/api.ts"
}, (opts) => deleteWidget.__executeServer(opts));
var deleteWidget = createServerFn({ method: "POST" }).validator((id) => id).middleware([authMiddleware]).handler(deleteWidget_createServerFn_handler, async ({ context, data: id }) => {
	await (await getSql())`delete from saved_widgets where id = ${id} and user_id = ${context.userId}`;
	return { ok: true };
});
//#endregion
export { deleteWidget_createServerFn_handler, getWidget_createServerFn_handler, listWidgets_createServerFn_handler, saveWidget_createServerFn_handler };
