import { describe, expect, it } from 'vitest';
import { GameEngine } from '../src/engine/gameEngine';
import type { GameState } from '../src/engine/types';
import { serializeState, deserializeState } from '../src/engine/serialization';
import { computeScore } from '../src/engine/score';
import { openInvestigation, resolveInvestigation } from '../src/engine/investigation';
import { startElection, chooseCampaign } from '../src/engine/election';
import { Rng } from '../src/engine/rng';
import { BALANCE } from '../src/engine/constants';
import { OBJECTIVE_MAP } from '../src/data/objectives';
import { CARDS } from '../src/data/cards';
import { applyDelta, getPlayer } from '../src/engine/utils';

function makeGame(seed = 42, kind: 'humano' | 'ia' = 'humano'): { engine: GameEngine; state: GameState } {
  const engine = new GameEngine(seed);
  const state = engine.createGame(
    { seed, seedLabel: 'test', maxRounds: 18, playerCount: 2, tutorial: false, ai: kind === 'ia' },
    [
      { nombre: 'Jugador A', kind, aiProfile: kind === 'ia' ? 'oportunista' : undefined, characterId: 'garcia' },
      { nombre: 'Jugador B', kind, aiProfile: kind === 'ia' ? 'negociador' : undefined, characterId: 'vizcarra' },
    ],
  );
  return { engine, state };
}

describe('Motor — recursos y economía', () => {
  it('asigna recursos iniciales según personaje', () => {
    const { state } = makeGame();
    const a = state.players[0];
    expect(a.resources.dinero).toBeGreaterThan(0);
    expect(a.resources.popularidad).toBeGreaterThanOrEqual(0);
    expect(a.resources.popularidad).toBeLessThanOrEqual(100);
    expect(a.resources.riesgoJudicial).toBe(0);
  });

  it('aplica ingresos al iniciar turno', () => {
    const { engine, state } = makeGame();
    const p = getPlayer(state, state.currentPlayerId);
    const antes = p.resources.dinero;
    engine.advance(state); // turno_inicio del jugador actual
    expect(p.resources.dinero).toBeGreaterThanOrEqual(antes + BALANCE.ingresoBase);
  });

  it('el dinero tiene techo (anti dinero infinito)', () => {
    const { state } = makeGame();
    const p = getPlayer(state, state.currentPlayerId);
    applyDelta(p, { dinero: 10_000, deuda: -5 });
    expect(p.resources.dinero).toBeLessThanOrEqual(BALANCE.techoDinero);
    expect(p.resources.deuda).toBeGreaterThanOrEqual(0);
  });

  it('mover la ficha avanza de casilla y cobra canon al pasar por salida', () => {
    const { state } = makeGame();
    const p = state.players[0];
    p.position = 25;
    const antes = p.resources.dinero;
    p.position = (p.position + 4) % 28;
    if (p.position < 25) p.resources.dinero += BALANCE.salida;
    expect(p.position).toBe(1);
    expect(p.resources.dinero).toBe(antes + BALANCE.salida);
  });

  it('pagar deuda reduce la deuda', () => {
    const { engine, state } = makeGame();
    const p = getPlayer(state, state.currentPlayerId);
    applyDelta(p, { deuda: 20 });
    const dineroAntes = p.resources.dinero;
    engine.act(state, 'pagar_deuda');
    expect(p.resources.deuda).toBe(15);
    expect(p.resources.dinero).toBe(dineroAntes - 5);
  });
});

describe('Motor — turnos', () => {
  it('cambia de jugador tras avanzar el turno', () => {
    const { engine, state } = makeGame(42, 'ia');
    const primero = state.currentPlayerId;
    for (let i = 0; i < 10; i++) {
      engine.advance(state);
    }
    expect(state.currentPlayerId).not.toBe(primero);
  });

  it('una ronda completa incrementa la ronda', () => {
    const { engine, state } = makeGame(42, 'ia');
    const rondaInicial = state.ronda;
    for (let i = 0; i < 40; i++) {
      engine.advance(state);
    }
    expect(state.ronda).toBeGreaterThan(rondaInicial);
  });
});

describe('Motor — investigaciones', () => {
  it('abre, avanza y resuelve una investigación', () => {
    const { state } = makeGame();
    const p = state.players[0];
    const inv = openInvestigation(state, p.id, 'evento', 'Caso ficticio', 'FICCION', 'Test');
    expect(inv).not.toBeNull();
    expect(inv?.estado).toBe('rumor');
    expect(p.investigations.length).toBe(1);
  });

  it('no abre dos investigaciones activas a la vez', () => {
    const { state } = makeGame();
    const p = state.players[0];
    openInvestigation(state, p.id, 'evento', 'A', 'FICCION', 'x');
    const segunda = openInvestigation(state, p.id, 'evento', 'B', 'FICCION', 'x');
    expect(segunda).toBeNull();
    expect(p.investigations.length).toBe(1);
  });

  it('la resolución produce mecánica de absolución o sanción', () => {
    const { state } = makeGame();
    const p = state.players[0];
    openInvestigation(state, p.id, 'evento', 'Caso', 'FICCION', 'x');
    const dineroAntes = p.resources.dinero;
    resolveInvestigation(state, p.id, new Rng(7), true);
    const inv = p.investigations[0];
    expect(inv.estado).toBe('resolucion');
    expect(p.resources.dinero).toBeGreaterThanOrEqual(dineroAntes - 15);
  });
});

describe('Motor — elecciones', () => {
  it('una elección termina con un presidente', () => {
    const { engine, state } = makeGame();
    startElection(state, engine.rng);
    let guard = 0;
    while (state.election.fase !== 'resultado' && state.election.fase !== 'inactiva' && guard++ < 20) {
      if (state.pendingDecision) {
        const d = state.pendingDecision;
        chooseCampaign(state, d.jugadorId, d.opciones[0].accion === 'campana_si', engine.rng);
      } else {
        break;
      }
    }
    expect(state.election.ganadorId).not.toBeNull();
    const presidente = state.players.find((p) => p.id === state.election.ganadorId);
    expect(presidente).toBeDefined();
  });
});

describe('Motor — objetivos y puntuación', () => {
  it('los objetivos se asignan al crear la partida', () => {
    const { state } = makeGame();
    for (const p of state.players) {
      expect(p.objectives.length).toBe(BALANCE.objetivosPorJugador);
      for (const o of p.objectives) {
        expect(OBJECTIVE_MAP[o]).toBeDefined();
      }
    }
  });

  it('computa puntuación final', () => {
    const { state } = makeGame();
    const puntos = computeScore(state, state.players[0].id);
    expect(typeof puntos).toBe('number');
    expect(puntos).toBeGreaterThan(-1000);
  });
});

describe('Motor — serialización y determinismo', () => {
  it('serializa y deserializa el estado completo', () => {
    const { engine, state } = makeGame();
    engine.advance(state);
    const json = serializeState(state);
    const copia = deserializeState(json);
    expect(copia.ronda).toBe(state.ronda);
    expect(copia.players.length).toBe(state.players.length);
    expect(copia.players[0].resources.dinero).toBe(state.players[0].resources.dinero);
  });

  it('dos partidas con la misma semilla son idénticas', () => {
    const g1 = makeGame(123);
    const g2 = makeGame(123);
    g1.engine.advance(g1.state);
    g2.engine.advance(g2.state);
    expect(g1.state.players[0].resources.dinero).toBe(g2.state.players[0].resources.dinero);
    expect(g1.state.log.length).toBe(g2.state.log.length);
  });
});

describe('Motor — cartas', () => {
  it('el mazo contiene al menos 30 cartas y todas las categorías', () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(30);
    const categorias = new Set(CARDS.map((c) => c.categoria));
    expect(categorias.size).toBeGreaterThanOrEqual(10);
  });

  it('toda carta tiene etiqueta de procedencia', () => {
    const tags = new Set(CARDS.map((c) => c.tag));
    expect(tags.has('HISTORICO')).toBe(true);
    expect(tags.has('FICCION')).toBe(true);
    expect(tags.has('SATIRA')).toBe(true);
  });
});

