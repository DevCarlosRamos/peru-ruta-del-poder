import { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine, RosterEntry } from '../engine/gameEngine';
import type { GameConfig, GameState } from '../engine/types';
import { cloneState } from '../engine/serialization';
import { saveGame, loadGame, clearGame } from '../storage/save';

export type Screen = 'home' | 'newgame' | 'rules' | 'game' | 'result';

/**
 * Hook central de la UI: mantiene el GameState en React, y delega TODA la
 * lógica de reglas al GameEngine (motor puro, independiente de la UI).
 */
export function useGame() {
  const [screen, setScreen] = useState<Screen>('home');
  const [state, setState] = useState<GameState | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [canContinue, setCanContinue] = useState(true);

  const commit = useCallback((next: GameState) => {
    setState(next);
    saveGame(next);
  }, []);

  const startGame = useCallback(
    (config: GameConfig, roster: RosterEntry[]) => {
      const engine = new GameEngine(config.seed);
      engineRef.current = engine;
      const s = engine.createGame(config, roster);
      s.rngState = engine.rng.getState();
      commit(s);
      setScreen('game');
    },
    [commit],
  );

  const loadSaved = useCallback(() => {
    const s = loadGame();
    if (!s) return false;
    // Restaurar la semilla y el estado del RNG si existen.
    const seed = s.config.seed;
    const engine = new GameEngine(seed);
    if (typeof s.rngState === 'number') engine.rng.setState(s.rngState);
    engineRef.current = engine;
    setState(s);
    setScreen('game');
    return true;
  }, []);

  const advance = useCallback(() => {
    if (!state || !engineRef.current) return;
    const next = cloneState(state);
    engineRef.current.advance(next);
    next.rngState = engineRef.current.rng.getState();
    commit(next);
  }, [state, commit]);

  const choose = useCallback(
    (index: number) => {
      if (!state || !engineRef.current) return;
      const next = cloneState(state);
      engineRef.current.choose(next, index);
      next.rngState = engineRef.current.rng.getState();
      commit(next);
      // La IA puede continuar sola tras una elección humana.
      setCanContinue(true);
    },
    [state, commit],
  );

  const act = useCallback(
    (actionId: string) => {
      if (!state || !engineRef.current) return;
      const next = cloneState(state);
      engineRef.current.act(next, actionId);
      next.rngState = engineRef.current.rng.getState();
      commit(next);
    },
    [state, commit],
  );

  const reset = useCallback(() => {
    clearGame();
    engineRef.current = null;
    setState(null);
    setScreen('home');
  }, []);

  const goTo = useCallback((s: Screen) => setScreen(s), []);

  useEffect(() => {
    if (!state) return;
    const activo = state.players.find((p) => p.id === state.currentPlayerId);
    const puedeAvanzar =
      !state.winner &&
      state.phase !== 'fin_partida' &&
      (state.pendingDecision === null || activo?.kind === 'ia');
    setCanContinue(puedeAvanzar);
    if (state.winner && state.phase === 'fin_partida') {
      setScreen('result');
    }
  }, [state]);

  return { screen, state, startGame, loadSaved, advance, choose, act, reset, goTo, canContinue };
}

