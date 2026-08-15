import { describe, expect, it } from 'vitest';
import { simulateGame, runSimulations } from '../src/engine/simulations/simulate';
import { GameEngine } from '../src/engine/gameEngine';
import { Rng } from '../src/engine/rng';
import { CHARACTERS } from '../src/data/characters';

describe('Integración — partida completa automatizada', () => {
  it('una partida IA vs IA llega a un ganador sin colgarse', () => {
    const resultado = simulateGame(999);
    expect(resultado.ganadorId).not.toBe('none');
    expect(resultado.motivo).not.toBe('sin_fin');
    expect(resultado.rondas).toBeGreaterThanOrEqual(1);
  }, 30_000);

  it('el ganador es uno de los jugadores registrados', () => {
    const resultado = simulateGame(4242);
    const ids = resultado.jugadores.map((j) => j.id);
    expect(ids).toContain(resultado.ganadorId);
  }, 30_000);

  it('todas las partidas de una tanda terminan (sin estados bloqueados)', () => {
    const resultados = runSimulations(25);
    expect(resultados.length).toBe(25);
    for (const r of resultados) {
      expect(r.motivo).not.toBe('sin_fin');
    }
  }, 60_000);

  it('ninguna partida IA vs IA termina antes de la ronda 4 (regresión de victoria instantánea)', () => {
    for (let semilla = 5000; semilla < 5050; semilla++) {
      const r = simulateGame(semilla, { playerCount: 3 });
      expect(r.rondas, `semilla ${semilla} terminó en ronda ${r.rondas} (motivo ${r.motivo})`).toBeGreaterThanOrEqual(4);
    }
  }, 90_000);

  it('ninguna partida IA vs IA gana por objetivos antes de la ronda 5 (bug Palacio+Balotaje)', () => {
    for (let semilla = 10_000; semilla < 10_060; semilla++) {
      const r = simulateGame(semilla, { playerCount: 3 });
      if (r.motivo === 'objetivos') {
        expect(r.rondas, `semilla ${semilla} ganó por objetivos en ronda ${r.rondas}`).toBeGreaterThanOrEqual(5);
      }
    }
  }, 90_000);
});

describe('Integración — determinismo del motor', () => {
  it('la misma semilla produce exactamente la misma partida', () => {
    const jugar = (seed: number) => {
      const engine = new GameEngine(seed);
      const state = engine.createGame(
        { seed, seedLabel: 'd', maxRounds: 6, playerCount: 2, tutorial: false, ai: true },
        [
          { nombre: 'IA A', kind: 'ia', aiProfile: 'agresivo', characterId: 'fujimori' },
          { nombre: 'IA B', kind: 'ia', aiProfile: 'conservador', characterId: 'toledo' },
        ],
      );
      let guard = 0;
      while (!state.winner && state.ronda <= state.config.maxRounds && guard++ < 500) {
        engine.advance(state);
      }
      return {
        ronda: state.ronda,
        dinero: state.players.map((p) => p.resources.dinero),
        turnos: state.turnoGlobal,
        logLength: state.log.length,
      };
    };
    const a = jugar(77);
    const b = jugar(77);
    expect(a).toEqual(b);
  }, 30_000);
});

describe('Integración — contenido', () => {
  it('todos los personajes pueden iniciar una partida', () => {
    for (const char of CHARACTERS) {
      const engine = new GameEngine(5);
      const state = engine.createGame(
        { seed: 5, seedLabel: 'x', maxRounds: 3, playerCount: 1, tutorial: false, ai: true },
        [{ nombre: 'IA', kind: 'ia', aiProfile: 'oportunista', characterId: char.id }],
      );
      expect(state.players[0].characterId).toBe(char.id);
      expect(state.players[0].objectives.length).toBeGreaterThan(0);
    }
  });
});
