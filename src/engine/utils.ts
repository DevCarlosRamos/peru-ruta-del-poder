import type { GameState, Player, ResourceDelta, Resources } from './types';
import { BALANCE, MAX_HISTORY } from './constants';

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Recursos que tienen techo 0-100. */
const BOUNDED: (keyof Resources)[] = [
  'popularidad',
  'influencia',
  'poder',
  'apoyoPolitico',
  'riesgoInstitucional',
  'riesgoJudicial',
];

/**
 * Aplica un delta a los recursos de un jugador y normaliza los valores.
 * `dinero` no baja de -50 (quiebra); los recursos 0-100 se recortan a ese rango.
 */
export function applyDelta(p: Player, delta: ResourceDelta): void {
  for (const key of Object.keys(delta) as (keyof Resources)[]) {
    const value = delta[key];
    if (value === undefined || value === 0) continue;
    p.resources[key] += value;
  }
  for (const key of BOUNDED) {
    p.resources[key] = clamp(Math.round(p.resources[key]), 0, 100);
  }
  if (p.resources.dinero > BALANCE.techoDinero) {
    p.resources.dinero = BALANCE.techoDinero;
  }
  p.resources.deuda = Math.max(0, Math.round(p.resources.deuda));
  p.resources.dinero = Math.round(p.resources.dinero);
}

/** Devuelve el jugador por id. */
export function getPlayer(state: GameState, id: string): Player {
  const p = state.players.find((x) => x.id === id);
  if (!p) throw new Error(`Jugador no existe: ${id}`);
  return p;
}

export function currentPlayer(state: GameState): Player {
  return getPlayer(state, state.currentPlayerId);
}

/** Registra una entrada en el historial (limitado para no inflar el estado). */
export function log(
  state: GameState,
  mensaje: string,
  tipo: 'info' | 'positivo' | 'negativo' | 'crisis' | 'eleccion' | 'sistema' = 'info',
  jugadorId?: string,
): void {
  state.log.push({
    turno: state.turnoGlobal,
    ronda: state.ronda,
    jugadorId: jugadorId ?? state.currentPlayerId,
    mensaje,
    tipo,
  });
  if (state.log.length > MAX_HISTORY) {
    state.log.splice(0, state.log.length - MAX_HISTORY);
  }
}

export function formatMoney(v: number): string {
  return `S/ ${v}`;
}

/** Número determinista usado para ordenar turnos al inicio (1d6 + influencia). */
export function sortByOrder(a: Player, b: Player): number {
  return a.orden - b.orden;
}

/** Genera un id corto único. */
export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sumDeltas(a: ResourceDelta, b: ResourceDelta): ResourceDelta {
  const out: ResourceDelta = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof Resources>) {
    const va = a[k] ?? 0;
    const vb = b[k] ?? 0;
    if (va + vb !== 0) out[k] = va + vb;
  }
  return out;
}
