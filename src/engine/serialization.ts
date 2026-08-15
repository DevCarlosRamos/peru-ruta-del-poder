import type { GameState } from './types';

/**
 * Serialización del estado de partida.
 * El estado es un objeto JSON puro (sin funciones), por lo que puede
 * guardarse en localStorage, IndexedDB o D1 y restaurarse exactamente.
 */

/** Versión del formato de guardado. Se incrementa cuando cambian las reglas
 * de forma incompatible (p. ej. el fix de victoria temprana: versión 2). */
export const SAVE_VERSION = 2;

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

/**
 * ¿Es un estado que representa una partida EN CURSO (no terminada)?
 * Rechaza guardados de versiones antiguas (con bugs) y partidas ya terminadas
 * (con winner), para que nunca se cargue una "victoria fantasma".
 */
export function esPartidaEnCurso(state: GameState | null | undefined): boolean {
  if (!state) return false;
  if (state.version < SAVE_VERSION) return false;
  if (state.winner) return false;
  if (state.phase === 'fin_partida') return false;
  if (!Array.isArray(state.players) || state.players.length === 0) return false;
  return true;
}

export function cloneState(state: GameState): GameState {
  return deserializeState(serializeState(state));
}

