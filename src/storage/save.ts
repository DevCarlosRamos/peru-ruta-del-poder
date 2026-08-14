import type { GameState } from '../engine/types';
import { serializeState, deserializeState } from '../engine/serialization';

/**
 * Persistencia local (localStorage).
 * El guardado remoto (D1) vive en src/api/cloudflare.ts.
 */
const KEY = 'peru-ruta-del-poder:save:v1';

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(KEY, serializeState(state));
  } catch {
    // Sin almacenamiento disponible: se ignora silenciosamente.
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return deserializeState(raw);
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // noop
  }
}
