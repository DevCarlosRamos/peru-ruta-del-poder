import type { GameState } from './types';
import { log } from './utils';
import { applyDebtInterest } from './economy';

/**
 * Gestión de TURNOS de "PERÚ: LA RUTA DEL PODER".
 * Una ronda = un turno por jugador activo. Al cerrar la ronda se cobran
 * intereses y avanzan los mandatos presidenciales.
 */

/** Avanza al siguiente jugador activo y gestiona el fin de ronda. */
export function advanceTurn(state: GameState): void {
  const activos = state.players
    .filter((p) => p.activo && !p.eliminado)
    .sort((a, b) => a.orden - b.orden);
  if (activos.length === 0) return;

  const idx = activos.findIndex((p) => p.id === state.currentPlayerId);
  const ultimoDeLaRonda = idx === activos.length - 1;
  const siguiente = activos[(idx + 1) % activos.length];

  if (ultimoDeLaRonda) {
    state.ronda += 1;
    applyDebtInterest(state);
    // Avanzan los mandatos presidenciales (1 ronda consumida).
    for (const p of state.players) {
      if (p.isPresident && p.mandateTurns > 0) {
        p.mandateTurns -= 1;
        if (p.mandateTurns <= 0) {
          log(state, `${p.nombre} completa su mandato presidencial.`, 'eleccion', p.id);
        }
      }
    }
    log(state, `— Fin de la ronda ${state.ronda}. —`, 'sistema');
  }

  state.currentPlayerId = siguiente.id;
  state.turnoGlobal += 1;
  state.phase = 'turno_inicio';
  state.pendingDecision = null;
}

/** Los jugadores desbloqueados por sanción (mecánica) recuperan cada turno. */
export function tickBlocked(state: GameState): void {
  for (const p of state.players) {
    if (p.bloqueadoPresidencia > 0) p.bloqueadoPresidencia -= 1;
  }
}
