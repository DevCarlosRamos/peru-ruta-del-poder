import { BALANCE } from './constants';
import { Rng } from './rng';
import type { AIProfileName, GameConfig, GameState, Player, PendingDecision, PlayerKind } from './types';
import { BOARD } from '../data/board';
import { CHARACTER_MAP } from '../data/characters';
import { createProjects } from '../data/projects';
import { OBJECTIVE_IDS, OBJECTIVE_MAP, checkObjective } from '../data/objectives';
import { applyDelta, getPlayer, log, clamp } from './utils';
import { startOfTurnEconomy, applyInflation, tickProjectsAndAlliances, checkBankruptcy } from './economy';
import { movePlayer, resolveTile, buyAsset, startProject, createAlliance, repopulateMarket } from './board';
import { drawCard, resolveCard, applyCardChoice } from './cards';
import { startElection, chooseCampaign, createInactiveElection } from './election';
import { resolveInvestigation, tryOpenInvestigationByRisk } from './investigation';
import { penalizacionesDeRiesgo, aplicarDebilidadesPorRiesgo, riesgoDeVacancia } from './risk';
import { advanceTurn, tickBlocked } from './turnManager';
import { computeFinalScores, computeScore } from './score';
import { aiChoose, aiDecideAction } from './ai';

/**
 * MOTOR DE REGLAS de "PERÚ: LA RUTA DEL PODER".
 * Independiente de la UI: muta un GameState serializable y es determinista
 * dado una semilla.
 *
 * Flujo por turno:
 * INICIO → economía/proyectos → ROLL (dado) → MOVER → RESOLVER CASILLA →
 * DECISIÓN (1 acción) → CHECK (riesgo/investigaciones/vacancia/objetivos) →
 * VICTORIA → FIN DE TURNO.
 *
 * ETAPA A (carrera): los jugadores circulan por el tablero acumulando recursos.
 * ETAPA B (gobierno): el presidente, en su turno, resuelve una "Decisión
 * presidencial" en lugar de mover; su mandato dura N rondas.
 */
export class GameEngine {
  readonly rng: Rng;

  constructor(seed: number) {
    this.rng = new Rng(seed);
  }

  /** Crea una partida nueva. `roster` define a los jugadores (orden de creación). */
  createGame(config: GameConfig, roster: RosterEntry[]): GameState {
    const rng = this.rng;
    const players = roster.map((r, i) => this.createPlayer(r, i));

    // Orden inicial de turno: dado + influencia (determinista).
    const orden = players
      .map((p) => ({ p, s: rng.dice() + p.resources.influencia / 10 + rng.next() }))
      .sort((a, b) => b.s - a.s);
    orden.forEach((o, i) => (o.p.orden = i + 1));

    const pool = rng.shuffle(OBJECTIVE_IDS);
    for (const p of players) {
      p.objectives = pool.splice(0, BALANCE.objetivosPorJugador);
    }

    const state: GameState = {
      version: 1,
      id: `partida_${config.seedLabel}_${Date.now().toString(36)}`,
      config,
      ronda: 1,
      turnoGlobal: 1,
      phase: 'turno_inicio',
      currentPlayerId: orden[0].p.id,
      players,
      board: BOARD,
      market: [],
      deck: [],
      drawPile: [],
      discardPile: [],
      hand: {},
      currentCardId: null,
      pendingDecision: null,
      election: createInactiveElection(),
      economia: { inflacion: 0, mercado: 'estable', periodoFiscal: 1, impuestosRecibidos: 0 },
      events: [],
      winner: null,
      log: [],
      autoBattle: config.ai,
      tutorialStep: 0,
      presidentId: null,
      objectivePool: pool,
      objectivePoolDefs: [],
      turnosEnGobierno: 0,
      terminada: false,
    };
    repopulateMarket(state, this.rng);
    log(state, `¡Comienza "PERÚ: LA RUTA DEL PODER"! ${players.map((p) => p.nombre).join(' vs ')}.`, 'sistema');
    return state;
  }

  private createPlayer(entry: RosterEntry, index: number): Player {
    const char = CHARACTER_MAP[entry.characterId];
    const base = BALANCE.startResources;
    const rec = char.recursosIniciales;
    return {
      id: `j${index + 1}`,
      nombre: entry.nombre || char.nombre,
      kind: entry.kind,
      aiProfile: entry.aiProfile,
      characterId: char.id,
      resources: {
        dinero: rec.dinero ?? base.dinero,
        popularidad: rec.popularidad ?? base.popularidad,
        influencia: rec.influencia ?? base.influencia,
        poder: rec.poder ?? base.poder,
        apoyoPolitico: rec.apoyoPolitico ?? base.apoyoPolitico,
        riesgoInstitucional: 0,
        riesgoJudicial: 0,
        deuda: 0,
      },
      position: 0,
      orden: index + 1,
      activo: true,
      eliminado: false,
      quiebra: false,
      assets: [],
      projects: [],
      alliances: [],
      investigations: [],
      objectives: [],
      objectivesCompleted: [],
      isPresident: false,
      mandateTurns: -1,
      mandateGoal: 0,
      electionResults: [],
      bloqueadoPresidencia: 0,
      skillsUsed: [],
      stats: {
        popularidadPerdida: 0,
        proyectosCompletados: 0,
        investigacionesSuperadas: 0,
        escandalosSufridos: 0,
        mandatosCompletados: 0,
        alianzasActivas: 0,
        ganadoElecciones: 0,
        invertido: 0,
      },
    };
  }

  /**
   * Avanza el flujo de la partida un paso (o varios, mientras no se requiera
   * la decisión de un jugador humano).
   */
  advance(state: GameState): void {
    if (state.winner || state.terminada) {
      state.phase = 'fin_partida';
      return;
    }
    let guard = 0;
    while (guard++ < 80) {
      const p = getPlayer(state, state.currentPlayerId);
      if (state.pendingDecision) {
        const d = state.pendingDecision;
        const dp = getPlayer(state, d.jugadorId);
        if (dp.kind === 'ia') {
          this.choose(state, aiChoose(state, dp, this.rng));
          continue;
        }
        return; // Esperando a un humano.
      }
      switch (state.phase) {
        case 'turno_inicio':
          this.stepTurnoInicio(state);
          continue;
        case 'roll':
          // El humano lanza el dado con un botón (feedback visual).
          if (p.kind === 'humano') return;
          this.stepRoll(state);
          continue;
        case 'movimiento':
          state.phase = 'casilla';
          continue;
        case 'casilla':
          this.stepCasilla(state);
          continue;
        case 'decision':
          if (p.kind === 'ia') {
            this.act(state, aiDecideAction(state, p, this.rng));
            continue;
          }
          return; // Esperando acción de un humano.
        case 'check':
          this.stepCheck(state);
          continue;
        case 'fin_turno':
          this.stepFinTurno(state);
          continue;
        case 'fin_partida':
          return;
        default:
          return;
      }
    }
  }

  private stepTurnoInicio(state: GameState): void {
    const p = getPlayer(state, state.currentPlayerId);
    startOfTurnEconomy(state, p.id);
    applyInflation(state, p.id);
    tickProjectsAndAlliances(state, p.id);
    checkBankruptcy(state, p.id);
    tickBlocked(state);

    // Habilidad "Página en blanco" (Vencedor 2026): una vez por partida.
    if (p.characterId === 'vencedor2026' && !p.skillsUsed.includes('pagina')) {
      p.skillsUsed.push('pagina');
      applyDelta(p, { influencia: 6 });
      log(state, `${p.nombre} activa "Página en blanco": +6 influencia.`, 'positivo', p.id);
    }

    state.phase = 'roll';
  }

  private stepRoll(state: GameState): void {
    const p = getPlayer(state, state.currentPlayerId);
    if (p.isPresident) {
      // ETAPA B — GOBIERNO: decisión presidencial en vez de mover.
      log(state, `${p.nombre} gobierna desde Palacio (mandato restante: ${p.mandateTurns} rondas).`, 'info', p.id);
      const card = drawCard(state, 'decision_presidencial', this.rng);
      if (card) resolveCard(state, card, p.id);
      state.phase = 'decision';
      return;
    }
    const dado = this.rng.dice();
    log(state, `${p.nombre} lanza el dado: ${dado}.`, 'info', p.id);
    movePlayer(state, p.id, dado);
    log(state, `${p.nombre} llega a "${BOARD[p.position].nombre}".`, 'info', p.id);
    state.phase = 'casilla';
  }

  private stepCasilla(state: GameState): void {
    resolveTile(state, this.rng);
    state.phase = 'decision';
  }

  private stepCheck(state: GameState): void {
    const p = getPlayer(state, state.currentPlayerId);
    penalizacionesDeRiesgo(state, p.id);
    aplicarDebilidadesPorRiesgo(state, p.id);
    tryOpenInvestigationByRisk(state, p.id, this.rng);

    // Crisis de vacancia presidencial (mecánica de juego).
    if (riesgoDeVacancia(p)) {
      state.pendingDecision = {
        id: `vacancia_${state.turnoGlobal}`,
        jugadorId: p.id,
        tipo: 'vacancia',
        titulo: '¡Crisis de vacancia presidencial!',
        descripcion:
          'El clima institucional y el Congreso (mecánica de juego) impulsan una moción. Tu apoyo político y tu influencia deciden el desenlace.',
        opciones: [
          { texto: 'Negociar con el Congreso (20 influencia, reduce el riesgo)', accion: 'vacancia_mitiga', requiereInfluencia: 20 },
          { texto: 'Enfrentar la moción', accion: 'vacancia_enfrentar' },
        ],
      };
      state.phase = 'decision';
      return;
    }

    this.checkObjetivosYVictoria(state, p.id);
    state.phase = 'fin_turno';
  }

  private stepFinTurno(state: GameState): void {
    advanceTurn(state);
    if (state.winner) {
      state.phase = 'fin_partida';
      return;
    }
    if (state.ronda > state.config.maxRounds) {
      this.finPorPuntuacion(state);
      return;
    }
    // Si no hay presidente (mandato terminado o vacancia), se convoca a elecciones.
    const presidente = state.players.find((p) => p.isPresident);
    if (!presidente && state.election.fase === 'inactiva') {
      startElection(state, this.rng);
    }
  }

  private checkObjetivosYVictoria(state: GameState, playerId: string): void {
    const p = getPlayer(state, playerId);

    // Mandato presidencial completado (victoria política principal).
    if (p.isPresident && p.mandateTurns === 0 && p.mandateGoal > 0) {
      p.stats.mandatosCompletados += 1;
      p.mandateGoal = 0;
      if (p.resources.popularidad >= 45) {
        const puntos = computeScore(state, p.id);
        state.winner = { playerId: p.id, motivo: 'mandato_completo', puntos };
        log(state, `¡${p.nombre} completa su mandato con respaldo popular y gana la partida!`, 'eleccion', p.id);
        return;
      }
      log(state, `${p.nombre} termina su mandato sin respaldo suficiente; habrá nuevas elecciones.`, 'info', p.id);
      p.isPresident = false;
      p.mandateTurns = -1;
      state.presidentId = null;
      startElection(state, this.rng);
      return;
    }

    // Objetivos de Poder.
    for (const oid of p.objectives) {
      if (!p.objectivesCompleted.includes(oid) && checkObjective(p, state, oid)) {
        p.objectivesCompleted.push(oid);
        applyDelta(p, { dinero: BALANCE.recompensaObjetivo });
        const def = OBJECTIVE_MAP[oid];
        log(state, `¡${p.nombre} cumple el objetivo "${def?.titulo ?? oid}"! (+${BALANCE.recompensaObjetivo} S/)`, 'positivo', p.id);
      }
    }
    if (p.objectives.length > 0 && p.objectives.every((o) => p.objectivesCompleted.includes(o))) {
      const puntos = computeScore(state, p.id);
      state.winner = { playerId: p.id, motivo: 'objetivos', puntos };
      log(state, `¡${p.nombre} cumple todos sus Objetivos de Poder y gana!`, 'positivo', p.id);
    }
  }

  /** El jugador elige una opción de la decisión pendiente. */
  choose(state: GameState, index: number): void {
    const d = state.pendingDecision;
    if (!d) return;
    const op = d.opciones[index];
    if (!op) return;
    const p = getPlayer(state, d.jugadorId);

    switch (d.tipo) {
      case 'carta':
      case 'carta_decision':
        applyCardChoice(state, d, op.accion ?? '');
        break;
      case 'investigacion_resolucion':
        resolveInvestigation(state, p.id, this.rng, op.accion === 'tribunal_defiende');
        break;
      case 'vacancia':
        this.resolveVacancia(state, p.id, op.accion === 'vacancia_mitiga');
        break;
      case 'tile':
      default:
        this.applyTileChoice(state, d, op);
        break;
    }
    state.phase = 'decision';
  }

  /** Ejecuta una acción directa del panel de acciones del turno. */
  act(state: GameState, actionId: string): void {
    const p = getPlayer(state, state.currentPlayerId);
    const char = CHARACTER_MAP[p.characterId];
    switch (actionId) {
      case 'terminar':
        state.phase = 'check';
        state.pendingDecision = null;
        return;
      case 'campana': {
        const costo = char?.habilidad.nombre === 'Base popular' ? 7 : BALANCE.acciones.campana.costo;
        if (p.resources.dinero < costo) {
          log(state, `${p.nombre} no tiene dinero para campaña.`, 'negativo', p.id);
          return;
        }
        const pop = char?.habilidad.nombre === 'Oratoria de tribuna'
          ? Math.ceil(BALANCE.acciones.campana.popularidad * 1.5)
          : BALANCE.acciones.campana.popularidad;
        applyDelta(p, { dinero: -costo, popularidad: pop, influencia: BALANCE.acciones.campana.influencia });
        log(state, `${p.nombre} lanza campaña (+${pop} popularidad).`, 'positivo', p.id);
        break;
      }
      case 'gestion': {
        applyDelta(p, {
          dinero: BALANCE.acciones.gestionRiesgosa.dinero,
          riesgoInstitucional: BALANCE.acciones.gestionRiesgosa.riesgoInstitucional,
          riesgoJudicial: BALANCE.acciones.gestionRiesgosa.riesgoJudicial,
        });
        log(state, `${p.nombre} toma una gestión riesgosa (+${BALANCE.acciones.gestionRiesgosa.dinero} S/, +riesgo).`, 'info', p.id);
        break;
      }
      case 'defender': {
        if (p.resources.dinero < BALANCE.acciones.defenderNombre.costo) {
          log(state, `${p.nombre} no tiene dinero para defenderse.`, 'negativo', p.id);
          return;
        }
        applyDelta(p, { dinero: -BALANCE.acciones.defenderNombre.costo, riesgoJudicial: -BALANCE.acciones.defenderNombre.reduceRiesgoJudicial });
        log(state, `${p.nombre} defiende su nombre (-${BALANCE.acciones.defenderNombre.reduceRiesgoJudicial} riesgo judicial).`, 'positivo', p.id);
        break;
      }
      case 'pagar_deuda': {
        if (p.resources.dinero < 5) {
          log(state, `${p.nombre} no tiene dinero para pagar deuda.`, 'negativo', p.id);
          return;
        }
        applyDelta(p, { dinero: -5, deuda: -5 });
        log(state, `${p.nombre} paga 5 de deuda.`, 'positivo', p.id);
        break;
      }
      case 'alianza': {
        if (p.resources.influencia < BALANCE.acciones.alianza.influenciaCosto) {
          log(state, `${p.nombre} no tiene suficiente influencia para alianzas.`, 'negativo', p.id);
          return;
        }
        const apoyo = char?.habilidad.nombre === 'Gran transformación'
          ? Math.ceil(BALANCE.acciones.alianza.apoyo * 1.5)
          : BALANCE.acciones.alianza.apoyo;
        applyDelta(p, { influencia: -BALANCE.acciones.alianza.influenciaCosto, apoyoPolitico: apoyo });
        p.alliances.push({
          id: `al_${Date.now().toString(36)}`,
          nombre: 'Pacto de salón',
          costoInfluencia: BALANCE.acciones.alianza.influenciaCosto,
          apoyoGanado: apoyo,
          beneficioDinero: 0,
          duracion: 4,
          turnosRestantes: 4,
          descripcion: 'Alianza ficticia formada desde el panel de acciones.',
          ficticio: true,
        });
        log(state, `${p.nombre} forja una alianza (+${apoyo} apoyo político).`, 'positivo', p.id);
        break;
      }
      case 'comprar': {
        const oferta = state.market[0];
        if (!oferta || p.resources.dinero < oferta.precio) {
          log(state, `${p.nombre} no puede comprar.`, 'negativo', p.id);
          return;
        }
        buyAsset(state, p.id, oferta.assetId, this.rng);
        break;
      }
      case 'proyecto': {
        const pr = createProjects()[0];
        if (p.resources.dinero < pr.costo) {
          log(state, `${p.nombre} no puede financiar proyectos.`, 'negativo', p.id);
          return;
        }
        startProject(state, p.id, pr.id);
        break;
      }
      default:
        return;
    }
    state.phase = 'check';
    state.pendingDecision = null;
  }

  private finPorPuntuacion(state: GameState): void {
    const scores = computeFinalScores(state);
    const ganador = scores[0];
    state.winner = { playerId: ganador.playerId, motivo: 'puntuacion', puntos: ganador.puntos };
    log(state, `La partida terminó por rondas: gana ${getPlayer(state, ganador.playerId).nombre} con ${ganador.puntos} puntos.`, 'eleccion');
    state.phase = 'fin_partida';
  }

  private applyTileChoice(state: GameState, d: PendingDecision, op: PendingDecision['opciones'][number]): void {
    const p = getPlayer(state, d.jugadorId);
    const accion = op.accion ?? '';
    const char = CHARACTER_MAP[p.characterId];

    if (accion === 'campana_mitin') {
      applyDelta(p, { popularidad: 4 });
      log(state, `${p.nombre} realiza un mitin exprés (+4 popularidad).`, 'positivo', p.id);
    } else if (accion === 'campana_paga') {
      const costo = char?.habilidad.nombre === 'Base popular' ? 7 : 10;
      if (p.resources.dinero < costo) {
        log(state, `${p.nombre} no puede financiar la campaña completa.`, 'negativo', p.id);
      } else {
        const pop = char?.habilidad.nombre === 'Oratoria de tribuna' ? 18 : 12;
        applyDelta(p, { dinero: -costo, popularidad: pop, influencia: 4 });
        log(state, `${p.nombre} hace campaña completa (+${pop} popularidad).`, 'positivo', p.id);
      }
    } else if (accion === 'congreso_cabildeo') {
      if (p.resources.influencia >= 5) {
        applyDelta(p, { influencia: -5, apoyoPolitico: 8 });
        log(state, `${p.nombre} cabildea en el Congreso (+8 apoyo político).`, 'positivo', p.id);
      } else {
        log(state, `${p.nombre} no tiene influencia para cabildear.`, 'negativo', p.id);
      }
    } else if (accion.startsWith('proyecto_') && accion !== 'proyecto_no') {
      const id = accion.replace('proyecto_', '');
      startProject(state, p.id, id);
    } else if (accion.startsWith('comprar_') && accion !== 'comprar_no') {
      const id = accion.replace('comprar_', '');
      buyAsset(state, p.id, id, this.rng);
    } else if (accion === 'medios_gratis') {
      applyDelta(p, { influencia: 4, popularidad: 3 });
      log(state, `${p.nombre} aparece en los medios (+influencia, +popularidad).`, 'positivo', p.id);
    } else if (accion === 'medios_paga') {
      if (p.resources.dinero >= 8) {
        applyDelta(p, { dinero: -8, influencia: 8, popularidad: 6 });
        log(state, `${p.nombre} lanza una campaña mediática.`, 'positivo', p.id);
      } else {
        log(state, `${p.nombre} no puede pagar la campaña mediática.`, 'negativo', p.id);
      }
    } else if (accion === 'oposicion_mitiga') {
      if (p.resources.influencia >= 6) {
        applyDelta(p, { influencia: -6, apoyoPolitico: -1 });
        log(state, `${p.nombre} mitiga la ofensiva opositora con influencia.`, 'info', p.id);
      } else {
        applyDelta(p, { apoyoPolitico: -4 });
        log(state, `${p.nombre} no pudo mitigar y pierde apoyo político.`, 'negativo', p.id);
      }
    } else if (accion === 'oposicion_aguanta') {
      applyDelta(p, { apoyoPolitico: -4 });
      log(state, `${p.nombre} aguanta el golpe de la oposición.`, 'negativo', p.id);
    } else if (accion.startsWith('alianza_') && accion !== 'alianza_no') {
      const key = accion.replace('alianza_', '');
      createAlliance(state, p.id, key);
    } else if (accion === 'campana_si') {
      chooseCampaign(state, p.id, true, this.rng);
      return;
    } else if (accion === 'campana_no') {
      chooseCampaign(state, p.id, false, this.rng);
      return;
    }
    state.pendingDecision = null;
  }

  private resolveVacancia(state: GameState, playerId: string, mitigar: boolean): void {
    const p = getPlayer(state, playerId);
    if (mitigar && p.resources.influencia < 20) {
      log(state, `${p.nombre} no tiene influencia para negociar la vacancia.`, 'negativo', p.id);
      mitigar = false;
    }
    let prob = BALANCE.vacanciaProbabilidadBase - p.resources.apoyoPolitico / 200;
    if (mitigar) {
      applyDelta(p, { influencia: -20 });
      prob -= 0.15;
    }
    prob = clamp(prob, 0.1, 0.9);

    if (this.rng.chance(prob)) {
      p.isPresident = false;
      p.mandateTurns = -1;
      state.presidentId = null;
      applyDelta(p, { poder: -BALANCE.vacanciaPenalidadPoder, popularidad: -15 });
      log(state, `¡${p.nombre} es vacado por el Congreso! Pierde poder y popularidad.`, 'crisis', p.id);
      state.pendingDecision = null;
      startElection(state, this.rng);
    } else {
      applyDelta(p, { riesgoInstitucional: -15, poder: 5 });
      log(state, `${p.nombre} sobrevive a la moción de vacancia (+5 poder).`, 'positivo', p.id);
      state.pendingDecision = null;
    }
  }
}

export interface RosterEntry {
  nombre: string;
  kind: PlayerKind;
  aiProfile?: AIProfileName;
  characterId: string;
}
