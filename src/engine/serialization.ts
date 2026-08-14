import type { GameState } from './types';

/**
 * Serialización del estado de partida.
 * El estado es un objeto JSON puro (sin funciones), por lo que puede
 * guardarse en localStorage, IndexedDB o D1 y restaurarse exactamente.
 */
export function serializeState(state: GameState): string {
  return JSON.stringify(state);
}

export function deserializeState(json: string): GameState {
  const parsed = JSON.parse(json) as GameState;
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.players)) {
    throw new Error('Guardado inválido: no es un GameState.');
  }
  return parsed;
}

export function cloneState(state: GameState): GameState {
  return deserializeState(serializeState(state));
}
