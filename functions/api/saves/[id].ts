/**
 * API de un guardado específico (Cloudflare Pages Functions + D1).
 * - GET    /api/saves/[id] → devuelve el estado completo.
 * - PUT    /api/saves/[id] → actualiza un guardado.
 * - DELETE /api/saves/[id] → elimina un guardado.
 */

interface Env {
  DB: D1Database;
}

const MAX_SAVE_BYTES = 1_500_000;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const id = String(params.id);
  const row = await env.DB.prepare('SELECT * FROM saves WHERE id = ?').bind(id).first();
  if (!row) return json({ error: 'Guardado no encontrado' }, 404);
  try {
    return json({ state: JSON.parse(row.state_json as string) });
  } catch {
    return json({ error: 'Guardado corrupto' }, 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = String(params.id);
  const body = (await request.json()) as { nombre?: string; state?: unknown };
  const state = body.state;
  if (!state || typeof state !== 'object') return json({ error: 'state inválido' }, 400);
  const stateJson = JSON.stringify(state);
  if (stateJson.length > MAX_SAVE_BYTES) return json({ error: 'Guardado demasiado grande' }, 413);
  const st = state as { version?: number; ronda?: number; turnoGlobal?: number; players?: { nombre?: string }[] };
  await env.DB.prepare(
    `UPDATE saves
     SET nombre = ?, state_json = ?, version = ?, ronda = ?, turno = ?, jugadores = ?, actualizado = ?
     WHERE id = ?`,
  )
    .bind(
      String(body.nombre ?? 'Partida').slice(0, 80),
      stateJson,
      st.version ?? 1,
      st.ronda ?? 1,
      st.turnoGlobal ?? 1,
      (st.players ?? []).map((p) => p.nombre ?? '').join(', '),
      Date.now(),
      id,
    )
    .run();
  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  const id = String(params.id);
  await env.DB.prepare('DELETE FROM saves WHERE id = ?').bind(id).run();
  return json({ ok: true });
};
