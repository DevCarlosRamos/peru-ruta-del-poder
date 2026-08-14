import type { GameState } from '../engine/types';
import { serializeState, deserializeState } from '../engine/serialization';

/**
 * Cliente del API de guardado remoto (Cloudflare Pages Functions + D1).
 * El backend es serverless (pago por uso); el juego funciona sin él usando
 * localStorage, y "Guardar en la nube" es opcional.
 */
const BASE = (import.meta.env?.VITE_API_BASE as string | undefined) ?? '/api';

export interface CloudSaveMeta {
  id: string;
  nombre: string;
  creado: number;
  actualizado: number;
  ronda: number;
  turno: number;
  jugadores: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export async function saveToCloud(state: GameState, nombre: string): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/saves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, state: deserializeState(serializeState(state)) }),
  });
  return handle<{ id: string }>(res);
}

export async function listCloudSaves(): Promise<CloudSaveMeta[]> {
  const res = await fetch(`${BASE}/saves`);
  return handle<CloudSaveMeta[]>(res);
}

export async function loadCloudSave(id: string): Promise<{ state: GameState }> {
  const res = await fetch(`${BASE}/saves/${id}`);
  return handle<{ state: GameState }>(res);
}

export async function deleteCloudSave(id: string): Promise<void> {
  const res = await fetch(`${BASE}/saves/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('No se pudo eliminar el guardado.');
}
