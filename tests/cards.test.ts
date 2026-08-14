import { describe, expect, it } from 'vitest';
import { GameEngine } from '../src/engine/gameEngine';
import { Rng } from '../src/engine/rng';
import {
  drawCard,
  applyCardChoice,
  addCardToHand,
  playCardFromHand,
  reshuffleDiscardToDeck,
  deckCounters,
} from '../src/engine/cards';
import { CARD_MAP, CARDS, ALL_CARD_IDS } from '../src/data/cards';
import type { GameState } from '../src/engine/types';
import { getPlayer, applyDelta } from '../src/engine/utils';

function makeGame(seed = 7): { engine: GameEngine; state: GameState } {
  const engine = new GameEngine(seed);
  const state = engine.createGame(
    { seed, seedLabel: 'cards', maxRounds: 5, playerCount: 2, tutorial: false, ai: false },
    [
      { nombre: 'A', kind: 'humano', characterId: 'garcia' },
      { nombre: 'B', kind: 'humano', characterId: 'vizcarra' },
    ],
  );
  return { engine, state };
}

describe('Sistema de cartas — mazo real', () => {
  it('el mazo se crea con todas las cartas barajadas', () => {
    const { state } = makeGame();
    expect(state.deck.length).toBe(CARDS.length);
    expect(new Set(state.deck).size).toBe(CARDS.length);
  });

  it('robar una carta la quita del mazo', () => {
    const { engine, state } = makeGame();
    const antes = state.deck.length;
    const card = drawCard(state, 'economia', engine.rng);
    expect(card).not.toBeNull();
    expect(card?.categoria).toBe('economia');
    expect(state.deck.length).toBe(antes - 1);
    expect(state.deck.includes(card?.id ?? '')).toBe(false);
  });

  it('cuando el mazo se agota, baraja el descarte de vuelta', () => {
    const { engine, state } = makeGame();
    state.deck = [];
    state.discardPile = ALL_CARD_IDS.slice(0, 10);
    reshuffleDiscardToDeck(state, engine.rng);
    expect(state.deck.length).toBe(10);
    expect(state.discardPile.length).toBe(0);
  });

  it('los contadores de mazo/descarte/mano son coherentes', () => {
    const { engine, state } = makeGame();
    const card = drawCard(state, 'oportunidad', engine.rng);
    expect(card).not.toBeNull();
    const c = deckCounters(state);
    expect(c.mazo).toBe(state.deck.length);
    expect(c.mano).toBe(0);
  });
});

describe('Sistema de cartas — decisiones probabilísticas', () => {
  it('resuelve una opción con probabilidad usando el RNG de la partida', () => {
    const { engine, state } = makeGame(1234);
    const p = getPlayer(state, state.currentPlayerId);
    applyDelta(p, { dinero: 300 }); // dar capital para la inversión
    const card = CARD_MAP['inv1']; // Invertir S/100, 70% éxito → +300
    const rng = new Rng(99);
    const dineroAntes = p.resources.dinero;
    applyCardChoice(state, { id: 'x', jugadorId: p.id, tipo: 'carta_decision', titulo: 'x', descripcion: 'x', cardId: 'inv1', opciones: [] }, 'carta_opcion_0', rng);
    // El costo se paga siempre (-100); el resultado puede ser éxito (+300) o fallo (-100).
    expect(p.resources.dinero).toBeGreaterThanOrEqual(dineroAntes - 200);
    expect(p.resources.dinero).toBeLessThanOrEqual(dineroAntes + 200);
    expect(state.log.some((l) => l.mensaje.includes('asume un riesgo'))).toBe(true);
  });

  it('una opción con costo bloquea al jugador sin dinero', () => {
    const { engine, state } = makeGame();
    const p = getPlayer(state, state.currentPlayerId);
    p.resources.dinero = 10;
    const rng = new Rng(3);
    applyCardChoice(state, { id: 'x', jugadorId: p.id, tipo: 'carta_decision', titulo: 'x', descripcion: 'x', cardId: 'inv1', opciones: [] }, 'carta_opcion_0', rng);
    expect(p.resources.dinero).toBe(10); // no se aplicó el costo
  });
});

describe('Sistema de cartas — mano del jugador', () => {
  it('guardar una carta la añade a la mano y jugarla la resuelve', () => {
    const { engine, state } = makeGame();
    const p = getPlayer(state, state.currentPlayerId);
    addCardToHand(state, p.id, 'oportunidad6');
    expect(state.hand[p.id]).toContain('oportunidad6');
    playCardFromHand(state, p.id, 'oportunidad6');
    expect(state.hand[p.id]).not.toContain('oportunidad6');
    // La carta resuelta crea una decisión (o la aplica automáticamente).
    expect(state.pendingDecision !== null || state.currentCardId !== null).toBe(true);
  });

  it('el mazo incluye las nuevas categorías de decisión', () => {
    const categorias = new Set(CARDS.map((c) => c.categoria));
    for (const cat of ['inversion', 'campana', 'congreso', 'evento_internacional']) {
      expect(categorias.has(cat as never)).toBe(true);
    }
    expect(CARDS.length).toBeGreaterThanOrEqual(60);
  });
});
