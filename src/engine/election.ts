import { BALANCE } from './constants';
import type { ElectionState, GameState } from './types';
import { applyDelta, getPlayer, log } from './utils';
import { CHARACTER_MAP } from '../data/characters';
import { Rng } from './rng';

/**
 * Sistema ELECTORAL de "PERÚ: LA RUTA DEL PODER".
 * Primera vuelta → segunda vuelta (balotaje) → presidente.
 * La campaña permite gastar dinero para sumar votos (esfuerzo estratégico).
 */

export function createInactiveElection(): ElectionState {
  return {
    fase: 'inactiva',
    turno: 0,
    participantes: [],
    resultadosPrimeraVuelta: [],
    finalistas: [],
    ganadorId: null,
    motivo: '',
    campaignIndex: 0,
    campaignChosen: {},
    campaignBonus: {},
  };
}

/** Calcula los "votos" (puntaje electoral) de un jugador. */
export function computeVotes(
  state: GameState,
  playerId: string,
  rng: Rng,
  campaignBonus: Record<string, number>,
): number {
  const p = getPlayer(state, playerId);
  const b = BALANCE;
  const bonusAlianzas = p.alliances.length * b.bonoElectoralAlianza;
  const bonusCampana = campaignBonus[playerId] ?? 0;
  const r = p.resources;
  let votos =
    r.popularidad * b.pesoElectoralPopularidad +
    r.influencia * b.pesoElectoralInfluencia +
    r.apoyoPolitico * b.pesoElectoralApoyo +
    r.poder * b.pesoElectoralPoder +
    bonusAlianzas +
    bonusCampana -
    r.riesgoInstitucional * b.penalidadElectoralRiesgo;
  votos += rng.dice();
  return Math.max(0, Math.round(votos));
}

/** Inicia una elección nacional. Los jugadores eligen campaña (o la IA la decide). */
export function startElection(state: GameState, rng: Rng): void {
  state.election = {
    ...createInactiveElection(),
    turno: state.turnoGlobal,
    participantes: state.players.filter((p) => p.activo && !p.eliminado).map((p) => p.id),
    fase: 'campaña',
    campaignIndex: 0,
  };
  log(state, '¡Comienza la campaña electoral!', 'eleccion');
  advanceCampaign(state, rng);
}

/** Procesa la elección de campaña del siguiente jugador o pasa a votación. */
export function advanceCampaign(state: GameState, rng: Rng): void {
  const participantes = state.election.participantes.filter(
    (id) => !state.election.campaignChosen[id],
  );
  if (participantes.length === 0) {
    resolvePrimeraVuelta(state, rng);
    return;
  }
  const siguiente = participantes[0];
  if (state.players.find((p) => p.id === siguiente)?.kind === 'ia') {
    const p = getPlayer(state, siguiente);
    const gastar = p.resources.dinero > 15 && (p.resources.popularidad < 60 || rng.chance(0.4));
    chooseCampaign(state, siguiente, gastar, rng);
  } else {
    state.pendingDecision = {
      id: `campana_${siguiente}`,
      jugadorId: siguiente,
      tipo: 'tile',
      titulo: 'Campaña electoral',
      descripcion: '¿Inviertes en tu campaña para la primera vuelta?',
      opciones: [
        { texto: 'Gastar S/ 10 en campaña (+6 votos)', accion: 'campana_si', requiereDinero: 10 },
        { texto: 'No gastar', accion: 'campana_no' },
      ],
    };
  }
}

export function chooseCampaign(state: GameState, playerId: string, gastar: boolean, rng: Rng): void {
  const p = getPlayer(state, playerId);
  if (gastar && p.resources.dinero >= 10) {
    applyDelta(p, { dinero: -10 });
    state.election.campaignBonus[playerId] = 6;
    log(state, `${p.nombre} invierte en su campaña.`, 'eleccion', playerId);
  } else {
    state.election.campaignBonus[playerId] = 0;
    if (gastar) log(state, `${p.nombre} no alcanza a financiar su campaña.`, 'info', playerId);
  }
  state.election.campaignChosen[playerId] = true;
  state.pendingDecision = null;
  advanceCampaign(state, rng);
}

/** Primera vuelta: votos de todos; los dos primeros pasan. */
export function resolvePrimeraVuelta(state: GameState, rng: Rng): void {
  const resultados = state.election.participantes.map((id) => ({
    playerId: id,
    votos: computeVotes(state, id, rng, state.election.campaignBonus),
  }));
  resultados.sort(
    (a, b) =>
      b.votos - a.votos ||
      getPlayer(state, b.playerId).resources.poder - getPlayer(state, a.playerId).resources.poder,
  );
  state.election.resultadosPrimeraVuelta = resultados;
  state.election.finalistas = resultados.slice(0, 2).map((r) => r.playerId);
  log(
    state,
    `Primera vuelta: ${resultados
      .map((r) => `${getPlayer(state, r.playerId).nombre} (${r.votos})`)
      .join(' — ')}.`,
    'eleccion',
  );
  if (state.election.finalistas.length < 2) {
    state.election.ganadorId = state.election.finalistas[0] ?? null;
    resolveElectionResult(state, rng);
    return;
  }
  state.election.fase = 'segunda_vuelta';
  log(
    state,
    `Segunda vuelta: ${state.election.finalistas
      .map((id) => getPlayer(state, id).nombre)
      .join(' vs ')}.`,
    'eleccion',
  );
  resolveSegundaVuelta(state, rng);
}

/** Segunda vuelta: batalla de votos entre los dos finalistas. */
export function resolveSegundaVuelta(state: GameState, rng: Rng): void {
  const [a, b] = state.election.finalistas;
  const va = computeVotes(state, a, rng, state.election.campaignBonus);
  const vb = computeVotes(state, b, rng, state.election.campaignBonus);
  const ganador = va >= vb ? a : b;
  state.election.ganadorId = ganador;
  log(
    state,
    `Balotaje: ${getPlayer(state, a).nombre} ${va} vs ${getPlayer(state, b).nombre} ${vb}. Gana ${getPlayer(state, ganador).nombre}.`,
    'eleccion',
  );
  resolveElectionResult(state, rng);
}


/** Aplica el resultado electoral: presidente, fichas, bonos y habilidades. */
export function resolveElectionResult(state: GameState, _rng: Rng): void {
  let ganadorId = state.election.ganadorId;
  const huboSegundaVuelta = state.election.fase === 'segunda_vuelta';
  state.election.fase = 'resultado';
  if (!ganadorId) {
    log(state, 'Elecciones sin resultado. Se reanuda la partida.', 'sistema');
    return;
  }
  let ganador = getPlayer(state, ganadorId);
  // Un candidato sancionado (mecánica de juego) no puede asumir; pasa el siguiente.
  if (ganador.bloqueadoPresidencia > 0) {
    const alterno =
      state.election.finalistas.find((id) => id !== ganadorId) ?? state.election.participantes[0];
    if (alterno) {
      log(
        state,
        `${ganador.nombre} queda impedido de asumir (mecánica de sanción). Asume ${getPlayer(state, alterno).nombre}.`,
        'negativo',
      );
      ganadorId = alterno;
      ganador = getPlayer(state, alterno);
    }
  }

  const anterior = state.players.find((p) => p.isPresident);
  if (anterior && anterior.id !== ganadorId) {
    anterior.isPresident = false;
    anterior.mandateTurns = -1;
    log(state, `${anterior.nombre} deja la presidencia.`, 'info', anterior.id);
  }

  ganador.isPresident = true;
  const char = CHARACTER_MAP[ganador.characterId];
  const duracion =
    char?.habilidad.nombre === 'Continuidad institucional'
      ? BALANCE.duracionMandatoRondas + 1
      : BALANCE.duracionMandatoRondas;
  ganador.mandateTurns = duracion;
  ganador.mandateGoal = duracion;
  ganador.position = 27; // Palacio de Gobierno
  ganador.stats.ganadoElecciones += 1;
  ganador.electionResults.push({
    turno: state.turnoGlobal,
    score: 0,
    result: huboSegundaVuelta ? 'segunda_vuelta' : 'primera_vuelta',
  });
  state.presidentId = ganador.id;
  state.turnosEnGobierno = 0;

  // Habilidad "Momento de esperanza" (Toledo).
  if (char?.habilidad.nombre === 'Momento de esperanza') {
    applyDelta(ganador, { popularidad: 12, apoyoPolitico: 5 });
    log(state, `${ganador.nombre} aprovecha su momento de esperanza (+popularidad).`, 'positivo', ganador.id);
  }
  // Debilidad "Legado polarizado" (Fujimori).
  if (char?.debilidad.nombre === 'Legado polarizado') {
    applyDelta(ganador, { popularidad: -5 });
    log(state, `${ganador.nombre}: su legado polarizado cuesta popularidad al asumir.`, 'negativo', ganador.id);
  }
  // Debilidades congresales (PPK y Vizcarra).
  if (char?.debilidad.nombre === 'Minoría en el Congreso' || char?.debilidad.nombre === 'Congreso hostil') {
    applyDelta(ganador, { apoyoPolitico: -5 });
    log(state, `${ganador.nombre}: su relación con el Congreso arranca cuesta arriba.`, 'negativo', ganador.id);
  }

  applyDelta(ganador, { poder: 10, popularidad: 6 });
  log(
    state,
    `${ganador.nombre} asume la presidencia de la República (mandato de ${duracion} rondas).`,
    'eleccion',
    ganador.id,
  );
  state.pendingDecision = null;
}
