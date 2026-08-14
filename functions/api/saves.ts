/**
 * API de guardado en la nube (Cloudflare Pages Functions + D1).
 * - GET /api/saves  → lista metadatos de guardados.
 * - POST /api/saves → crea un guardado { nombre, state }.
 *
 * El backend es serverless (pago por uso). El juego funciona sin él.
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

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const onRequestOptions = async (): Promise<Response> => {
  return new Response(null, { status: 204, headers: corsHeaders() });
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    `SELECT id, nombre, ronda, turno, jugadores, creado, actualizado
     FROM saves ORDER BY actualizado DESC LIMIT 50`,
  ).all();
  return json(results);
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }
  const b = body as { nombre?: unknown; state?: unknown };
  const nombre = String(b.nombre ?? 'Partida').slice(0, 80);
  const state = b.state;
  if (!state || typeof state !== 'object') {
    return json({ error: 'El campo state es obligatorio' }, 400);
  }
  const stateJson = JSON.stringify(state);
  if (stateJson.length > MAX_SAVE_BYTES) {
    return json({ error: 'Guardado demasiado grande' }, 413);
  }
  const st = state as { version?: number; ronda?: number; turnoGlobal?: number; players?: { nombre?: string }[] };
  const id = crypto.randomUUID();
  const ahora = Date.now();
  await env.DB.prepare(
    `INSERT INTO saves (id, nombre, state_json, version, ronda, turno, jugadores, creado, actualizado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      nombre,
      stateJson,
      st.version ?? 1,
      st.ronda ?? 1,
      st.turnoGlobal ?? 1,
      (st.players ?? []).map((p) => p.nombre ?? '').join(', '),
      ahora,
      ahora,
    )
    .run();
  return json({ id, nombre }, 201);
};
