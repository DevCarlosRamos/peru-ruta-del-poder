import { BALANCE } from './constants';
import type { GameState } from './types';
import { applyDelta, getPlayer, log } from './utils';
import { CHARACTER_MAP } from '../data/characters';

/** Ingresos al iniciar el turno de un jugador. */
export function startOfTurnEconomy(state: GameState, playerId: string): void {
  const p = getPlayer(state, playerId);
  const char = CHARACTER_MAP[p.characterId];

  let ingreso = BALANCE.ingresoBase;
  for (const a of p.assets) {
    ingreso += a.ingresoTurno;
  }
  // Habilidad "Conexiones globales" (PPK): +4 de ingreso pasivo.
  if (char?.habilidad.nombre === 'Conexiones globales') ingreso += 4;

  if (p.isPresident) {
    ingreso += BALANCE.presupuestoPorTurno;
    let gasto: number = BALANCE.gastoPalacio;
    // Habilidad "Continuidad institucional" (Boluarte): gasto de palacio a la mitad.
    if (char?.habilidad.nombre === 'Continuidad institucional') gasto = Math.ceil(gasto / 2);
    ingreso -= gasto;
  }

  applyDelta(p, { dinero: ingreso });
  if (ingreso > 0) {
    log(state, `${p.nombre} recibe ${ingreso} de ingresos${p.isPresident ? ' (presupuesto de gobierno)' : ''}.`, 'positivo', p.id);
  }
}

/** Inflación: si un jugador supera el umbral, pierde un % de su dinero. */
export function applyInflation(state: GameState, playerId: string): void {
  const p = getPlayer(state, playerId);
  if (p.resources.dinero > BALANCE.inflacionUmbral) {
    const perdida = Math.floor(p.resources.dinero * BALANCE.inflacionPerdidaPct);
    applyDelta(p, { dinero: -perdida });
    log(state, `La inflación erosiona el dinero de ${p.nombre} (-${perdida}).`, 'negativo', p.id);
  }
}

/** Intereses de la deuda: se aplican una vez por ronda completa. */
export function applyDebtInterest(state: GameState): void {
  for (const p of state.players) {
    if (p.eliminado) continue;
    if (p.resources.deuda > BALANCE.deudaGratis) {
      const interes = Math.max(0, Math.round(p.resources.deuda * BALANCE.interesDeudaPct));
      applyDelta(p, { deuda: interes });
      if (interes > 0) {
        log(state, `${p.nombre} paga ${interes} de intereses sobre su deuda.`, 'negativo', p.id);
      }
    }
  }
}

/**
 * Avanza proyectos y alianzas del jugador (tick al inicio de su turno).
 * Al completar un proyecto se cobran beneficios y popularidad.
 */
export function tickProjectsAndAlliances(state: GameState, playerId: string): void {
  const p = getPlayer(state, playerId);
  const char = CHARACTER_MAP[p.characterId];

  const completados: string[] = [];
  for (const pr of p.projects) {
    if (pr.estado !== 'activo') continue;
    pr.turnosRestantes -= 1;
    if (pr.turnosRestantes <= 0) {
      pr.estado = 'completado';
      completados.push(pr.nombre);
      let pop = pr.popularidadGanada;
      // Habilidad "Reformista" (Vizcarra): +50% popularidad por proyecto.
      if (char?.habilidad.nombre === 'Reformista') pop = Math.ceil(pop * 1.5);
      applyDelta(p, {
        dinero: pr.beneficio,
        popularidad: pop,
        influencia: pr.influenciaGanada,
        riesgoInstitucional: pr.riesgo,
      });
      p.stats.proyectosCompletados += 1;
      log(state, `${p.nombre} completó el proyecto "${pr.nombre}" (+${pr.beneficio}, +${pop} popularidad).`, 'positivo', p.id);
    }
  }
  if (completados.length > 0) {
    log(state, `${p.nombre} inaugura: ${completados.join(', ')}.`, 'positivo', p.id);
  }

  p.alliances = p.alliances.filter((al) => {
    al.turnosRestantes -= 1;
    if (al.turnosRestantes <= 0) {
      log(state, `La alianza "${al.nombre}" de ${p.nombre} llegó a su fin.`, 'info', p.id);
      return false;
    }
    return true;
  });
}

/** Verifica quiebra: si el dinero cae muy bajo, aplica penalidades. */
export function checkBankruptcy(state: GameState, playerId: string): void {
  const p = getPlayer(state, playerId);
  if (p.quiebra || p.resources.dinero > BALANCE.quiebra.umbral) return;
  p.quiebra = true;
  applyDelta(p, { poder: -BALANCE.quiebra.penalidadPoder, popularidad: -BALANCE.quiebra.penalidadPopularidad });
  log(state, `¡${p.nombre} quiebra! Pierde poder y popularidad, pero sigue en la partida.`, 'crisis', p.id);
}
