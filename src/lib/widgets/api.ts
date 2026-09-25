import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  isAccent,
  isEffect,
  isFont,
  isMode,
  isSize,
  isSlot,
  type SavedWidget,
} from "@/lib/widgets/types";

type Row = {
  id: string;
  name: string;
  mode: string;
  accent: string;
  font: string;
  size: string;
  effect: string;
  slot: string;
};

function toSaved(row: Row): SavedWidget | null {
  if (!isMode(row.mode) || !isAccent(row.accent) || !isFont(row.font) || !isSize(row.size) || !isEffect(row.effect) || !isSlot(row.slot)) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    mode: row.mode,
    accent: row.accent,
    font: row.font,
    size: row.size,
    effect: row.effect,
    slot: row.slot,
  };
}

export const listWidgets = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select id, name, mode, accent, font, size, effect, slot
      from saved_widgets
      where user_id = ${context.userId}
      order by created_at desc
    `;
    return rows.map(toSaved).filter((row): row is SavedWidget => row !== null);
  });

export const getWidget = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<Row>`
      select id, name, mode, accent, font, size, effect, slot
      from saved_widgets
      where id = ${id} and user_id = ${context.userId}
    `;
    const row = rows[0];
    return row ? toSaved(row) : null;
  });

type Draft = {
  name: string;
  mode: string;
  accent: string;
  font: string;
  size: string;
  effect: string;
  slot: string;
};

function parseDraft(input: Draft): Draft {
  const name = input.name.trim().slice(0, 40);
  if (!name || !isMode(input.mode) || !isAccent(input.accent) || !isFont(input.font) || !isSize(input.size) || !isEffect(input.effect) || !isSlot(input.slot)) {
    throw new Error("Diseño no válido");
  }
  return { name, mode: input.mode, accent: input.accent, font: input.font, size: input.size, effect: input.effect, slot: input.slot };
}

export const saveWidget = createServerFn({ method: "POST" })
  .validator((input: Draft) => parseDraft(input))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`
      insert into saved_widgets (id, user_id, name, mode, accent, font, size, effect, slot)
      values (${id}, ${context.userId}, ${data.name}, ${data.mode}, ${data.accent}, ${data.font}, ${data.size}, ${data.effect}, ${data.slot})
    `;
    return { id };
  });

export const deleteWidget = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from saved_widgets where id = ${id} and user_id = ${context.userId}`;
    return { ok: true };
  });
