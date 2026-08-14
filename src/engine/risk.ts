import { BALANCE } from './constants';
import type { GameState, Player, ResourceDelta } from './types';
import { applyDelta, getPlayer, log } from './utils';

/**
 * Sistema de "NIVEL DE RIESGO" (mecánica de exposición política/judicial).
 * El riesgo es una mecánica abstracta de juego, no una afirmación sobre
 * ningún personaje real.
 */

/** Probabilidad de que se abra una investigación dado el nivel de riesgo. */
export function probabilidadInvestigacion(riesgo: number, umbral: number, rngProb: () => number): boolean {
  if (riesgo < umbral) return false;
  const p = BALANCE.probabilidadInvestigacionBase + (riesgo - umbral) * BALANCE.probabilidadInvestigacionExtra;
  return rngProb() < p;
}

/** Penalizaciones por superar umbrales de riesgo institucional. */
export function riesgoInstitucionalAlto(p: Player): boolean {
  return p.resources.riesgoInstitucional >= BALANCE.riesgoInstitucionalUmbralInvestigacion;
}

export function riesgoJudicialAlto(p: Player): boolean {
  return p.resources.riesgoJudicial >= BALANCE.riesgoJudicialUmbralInvestigacion;
}

/** Riesgo de vacancia: el presidente con riesgo institucional extremo. */
export function riesgoDeVacancia(p: Player): boolean {
  return p.isPresident && p.resources.riesgoInstitucional >= BALANCE.vacanciaUmbral;
}

/** Efectos colaterales por riesgo alto (se evalúan en el check de turno). */
export function penalizacionesDeRiesgo(state: GameState, playerId: string): ResourceDelta {
  const p = getPlayer(state, playerId);
  const delta: ResourceDelta = {};
  if (p.resources.riesgoInstitucional >= 70) {
    delta.popularidad = (delta.popularidad ?? 0) - 3;
    log(state, `${p.nombre} pierde imagen por la tensión institucional.`, 'negativo', p.id);
  }
  if (p.resources.riesgoInstitucional >= 90) {
    delta.apoyoPolitico = (delta.apoyoPolitico ?? 0) - 3;
    log(state, `${p.nombre} pierde aliados en el Congreso por el clima de crisis.`, 'negativo', p.id);
  }
  if (p.resources.riesgoJudicial >= 70) {
    delta.influencia = (delta.influencia ?? 0) - 3;
    log(state, `${p.nombre} pierde influencia por su exposición judicial.`, 'negativo', p.id);
  }
  applyDelta(p, delta);
  return delta;
}

/** Aplica la debilidad "Sombras del pasado" (Toledo) si aplica. */
export function aplicarDebilidadesPorRiesgo(state: GameState, playerId: string): void {
  const p = getPlayer(state, playerId);
  if (p.characterId === 'toledo' && p.resources.riesgoJudicial > 50) {
    applyDelta(p, { influencia: -5 });
    log(state, `${p.nombre} pierde influencia por su exposición judicial (debilidad).`, 'negativo', p.id);
  }
  if (p.characterId === 'castillo' && p.resources.riesgoInstitucional > 50) {
    applyDelta(p, { influencia: -5 });
    log(state, `${p.nombre} pierde influencia por el ruido institucional (debilidad).`, 'negativo', p.id);
  }
}
