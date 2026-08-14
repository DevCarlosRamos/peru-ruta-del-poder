import type { GameState } from './types';
import { getPlayer } from './utils';

/**
 * Sistema de PUNTUACIÓN de "PERÚ: LA RUTA DEL PODER".
 *
 * Puntuación final =
 *   dinero/10 + influencia + popularidad + poder*1.5 + apoyo*0.5
 *   + activos*5 + proyectos completados*15 + objetivos*25
 *   - deuda*2 - riesgo institucional - riesgo judicial*2
 *   - penalización por quiebra + bonus presidencial.
 */
export function computeScore(state: GameState, playerId: string): number {
  const p = getPlayer(state, playerId);
  const r = p.resources;

  let score =
    r.dinero / 10 +
    r.influencia +
    r.popularidad +
    r.poder * 1.5 +
    r.apoyoPolitico * 0.5;
  score += p.assets.length * 5;
  score += p.stats.proyectosCompletados * 15;
  score += p.objectivesCompleted.length * 25;
  score -= r.deuda * 2;
  score -= r.riesgoInstitucional;
  score -= r.riesgoJudicial * 2;
  if (p.quiebra) score -= 20;
  if (p.isPresident) score += 15;
  if (p.eliminado) score -= 50;
  return Math.round(score);
}

export function computeFinalScores(state: GameState): { playerId: string; puntos: number }[] {
  return state.players
    .filter((p) => p.activo)
    .map((p) => ({ playerId: p.id, puntos: computeScore(state, p.id) }))
    .sort((a, b) => b.puntos - a.puntos);
}
