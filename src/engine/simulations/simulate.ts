import { GameEngine, RosterEntry } from '../gameEngine';
import type { GameState, WinReason, AIProfileName } from '../types';
import { CHARACTERS } from '../../data/characters';
import { AI_PROFILE_NAMES } from '../../data/aiProfiles';
import { Rng } from '../rng';

/**
 * Partidas automáticas sin interfaz (FASE 29 y 38):
 * permite validar el motor y medir el balance estadístico.
 */

export interface SimulationResult {
  seed: number;
  rondas: number;
  ganadorId: string;
  ganadorCharacter: string;
  motivo: WinReason | 'sin_fin';
  puntaje: number;
  jugadores: { id: string; personaje: string; perfil: string; puntaje: number }[];
  investigacionesTotales: number;
  eleccionesTotales: number;
  quiebras: number;
  dineroPromedio: number;
}

export function simulateGame(seed: number, config?: Partial<{ maxRounds: number; playerCount: number }>): SimulationResult {
  const rng = new Rng(seed);
  const count = config?.playerCount ?? 3;
  const roster: RosterEntry[] = [];
  const usados = new Set<number>();
  for (let i = 0; i < count; i++) {
    let ci = rng.int(0, CHARACTERS.length - 1);
    while (usados.has(ci)) ci = rng.int(0, CHARACTERS.length - 1);
    usados.add(ci);
    const perfil = AI_PROFILE_NAMES[rng.int(0, AI_PROFILE_NAMES.length - 1)] as AIProfileName;
    roster.push({
      nombre: CHARACTERS[ci].nombre,
      kind: 'ia',
      aiProfile: perfil,
      characterId: CHARACTERS[ci].id,
    });
  }

  const engine = new GameEngine(seed);
  const state = engine.createGame(
    { seed, seedLabel: String(seed), maxRounds: config?.maxRounds ?? 18, playerCount: count, tutorial: false, ai: true },
    roster,
  );

  let guard = 0;
  while (!state.winner && state.ronda <= state.config.maxRounds && guard++ < 3000) {
    engine.advance(state);
    if (state.pendingDecision) {
      // La IA siempre puede decidir; esto no debería ocurrir en modo auto.
      engine.choose(state, 0);
    }
  }
  if (state.winner && state.phase !== 'fin_partida') state.phase = 'fin_partida';

  return summarize(state, seed);
}

function summarize(state: GameState, seed: number): SimulationResult {
  const investigaciones = state.players.reduce((acc, p) => acc + p.investigations.length, 0);
  const quiebras = state.players.filter((p) => p.quiebra).length;
  const dineroPromedio =
    state.players.reduce((acc, p) => acc + p.resources.dinero, 0) / Math.max(1, state.players.length);
  return {
    seed,
    rondas: state.ronda,
    ganadorId: state.winner?.playerId ?? 'none',
    ganadorCharacter: state.winner ? state.players.find((p) => p.id === state.winner?.playerId)?.characterId ?? '' : '',
    motivo: state.winner?.motivo ?? 'sin_fin',
    puntaje: state.winner?.puntos ?? 0,
    jugadores: state.players.map((p) => ({
      id: p.id,
      personaje: p.characterId,
      perfil: p.aiProfile ?? 'humano',
      puntaje: 0,
    })),
    investigacionesTotales: investigaciones,
    eleccionesTotales: state.players.reduce((acc, p) => acc + p.stats.ganadoElecciones, 0),
    quiebras,
    dineroPromedio: Math.round(dineroPromedio),
  };
}

export function runSimulations(count: number): SimulationResult[] {
  const results: SimulationResult[] = [];
  for (let i = 0; i < count; i++) {
    try {
      results.push(simulateGame(1000 + i));
    } catch (e) {
      console.error(`Simulación ${i} falló:`, e);
    }
  }
  return results;
}

/** Métricas agregadas de balance por personaje. */
export function analyzeBalance(results: SimulationResult[]) {
  const porPersonaje: Record<string, { partidas: number; victorias: number; motivo: Record<string, number> }> = {};
  for (const r of results) {
    for (const j of r.jugadores) {
      (porPersonaje[j.personaje] ??= { partidas: 0, victorias: 0, motivo: {} });
      porPersonaje[j.personaje].partidas += 1;
      if (j.id === r.ganadorId) {
        porPersonaje[j.personaje].victorias += 1;
        porPersonaje[j.personaje].motivo[r.motivo] = (porPersonaje[j.personaje].motivo[r.motivo] ?? 0) + 1;
      }
    }
  }
  return Object.entries(porPersonaje)
    .map(([personaje, v]) => ({
      personaje,
      partidas: v.partidas,
      tasaVictorias: Math.round((v.victorias / Math.max(1, v.partidas)) * 1000) / 10,
      motivos: v.motivo,
    }))
    .sort((a, b) => b.tasaVictorias - a.tasaVictorias);
}
