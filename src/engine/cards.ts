import type { CardCategory, CardDecisionOption, CardDef, GameState, PendingDecision } from './types';
import { applyDelta, getPlayer, log } from './utils';
import { CARD_MAP } from '../data/cards';
import { Rng } from './rng';

/**
 * SISTEMA DE CARTAS del motor.
 * - Mazo real: las cartas viven en `state.deck`; al agotarse se baraja el descarte.
 * - Robo dirigido por categoría desde el mazo.
 * - Resolución central `applyCardChoice` con costos, probabilidades, éxito/fallo e
 *   historial detallado. La UI solo muestra; la lógica vive aquí.
 */

const CATEGORIA_SIEMPRE_INMEDIATA: CardCategory[] = [
  'crisis',
  'escandalo',
  'investigacion',
  'oposicion',
  'eleccion',
];

/** Roba una carta de una categoría desde el mazo real. */
export function drawCard(state: GameState, categoria: CardCategory, rng: Rng): CardDef | null {
  let id = buscarEnMazo(state, categoria);
  if (id === null) {
    // Mazo sin cartas de esa categoría: barajar el descarte de vuelta al mazo.
    reshuffleDiscardToDeck(state, rng);
    id = buscarEnMazo(state, categoria);
  }
  if (id === null) return null;
  state.deck = state.deck.filter((c) => c !== id);
  return CARD_MAP[id];
}

function buscarEnMazo(state: GameState, categoria: CardCategory): string | null {
  return state.deck.find((id) => CARD_MAP[id]?.categoria === categoria) ?? null;
}

/** Si el mazo se agota, las cartas descartadas vuelven barajadas. */
export function reshuffleDiscardToDeck(state: GameState, rng: Rng): void {
  if (state.deck.length > 0) return;
  if (state.discardPile.length === 0) return;
  state.deck = rng.shuffle(state.discardPile);
  state.discardPile = [];
  log(state, `El mazo se agotó: se barajan ${state.deck.length} cartas del descarte.`, 'sistema');
}

/** Agrega una carta a la mano de un jugador. */
export function addCardToHand(state: GameState, playerId: string, cardId: string): void {
  state.hand[playerId] ??= [];
  state.hand[playerId].push(cardId);
  log(state, `${getPlayer(state, playerId).nombre} guarda la carta "${CARD_MAP[cardId]?.nombre ?? cardId}" en su mano.`, 'info', playerId);
}

/** Juega una carta desde la mano (la activa para su resolución). */
export function playCardFromHand(state: GameState, playerId: string, cardId: string): void {
  const hand = state.hand[playerId] ?? [];
  if (!hand.includes(cardId)) return;
  state.hand[playerId] = hand.filter((c) => c !== cardId);
  const card = CARD_MAP[cardId];
  if (!card) return;
  resolveCard(state, card, playerId);
}

/** Determina si una carta tiene mezcla de beneficio y costo (decisiones aceptar/rechazar). */
function tieneMezcla(card: CardDef): boolean {
  const valores = Object.values(card.efectos);
  const positivo = valores.some((v) => v > 0);
  const negativo = valores.some((v) => v < 0) || card.riesgo.institucional + card.riesgo.judicial > 0;
  return positivo && negativo;
}

/** Aplica los efectos y riesgos de una carta a un jugador (camino automático). */
export function applyCardEffects(state: GameState, playerId: string, card: CardDef): void {
  const p = getPlayer(state, playerId);
  applyDelta(p, { ...card.efectos, riesgoInstitucional: card.riesgo.institucional, riesgoJudicial: card.riesgo.judicial });
  if (card.categoria === 'escandalo') {
    p.stats.escandalosSufridos += 1;
  }
  const detalle: string[] = [];
  for (const [k, v] of Object.entries(card.efectos)) {
    if (v && v !== 0) detalle.push(`${v > 0 ? '+' : ''}${v} ${k}`);
  }
  if (card.riesgo.institucional > 0) detalle.push(`+${card.riesgo.institucional} riesgo institucional`);
  if (card.riesgo.judicial > 0) detalle.push(`+${card.riesgo.judicial} riesgo judicial`);
  log(state, `Carta "${card.nombre}": ${detalle.join(', ') || 'sin efectos numéricos'}.`, 'info', p.id);
}

/** Convierte una opción de decisión rica en opción de PendingDecision. */
function opcionAPending(op: CardDecisionOption, i: number): PendingDecision['opciones'][number] {
  return {
    texto: op.texto,
    efecto: op.efectosFijos ?? op.efectosExito,
    consecuencias: op.efectosFallo ? 'Puede fallar' : undefined,
    requiereDinero: op.costoDinero,
    requiereInfluencia: op.costoInfluencia,
    probabilidad: op.probabilidad,
    costoDinero: op.costoDinero,
    costoInfluencia: op.costoInfluencia,
    accion: `carta_opcion_${i}`,
  };
}

/**
 * Resuelve una carta:
 * - Con `decision.opciones` ricas → PendingDecision con todas las opciones + rechazo/guardar.
 * - Con mezcla beneficio/costo → aceptar o rechazar.
 * - De otro modo → se aplica automáticamente.
 */
export function resolveCard(state: GameState, card: CardDef, jugadorId?: string): void {
  const p = getPlayer(state, jugadorId ?? state.currentPlayerId);
  state.currentCardId = card.id;

  if (card.decision && card.decision.opciones.length > 0) {
    const opciones: PendingDecision['opciones'] = card.decision.opciones.map(opcionAPending);
    if (card.guardable && CATEGORIA_SIEMPRE_INMEDIATA.indexOf(card.categoria) === -1) {
      opciones.push({ texto: '📥 Guardar esta carta para después', accion: 'carta_guardar' });
    }
    opciones.push({ texto: 'Rechazar la propuesta', accion: 'carta_rechazar' });
    state.pendingDecision = {
      id: `carta_${card.id}`,
      jugadorId: p.id,
      tipo: 'carta_decision',
      titulo: card.nombre,
      descripcion: card.descripcion,
      cardId: card.id,
      opciones,
    };
    return;
  }

  if (tieneMezcla(card)) {
    state.pendingDecision = {
      id: `carta_${card.id}`,
      jugadorId: p.id,
      tipo: 'carta',
      titulo: card.nombre,
      descripcion: card.descripcion,
      cardId: card.id,
      opciones: [
        { texto: 'Aceptar la situación', efecto: card.efectos, accion: 'carta_aceptar' },
        { texto: 'Evitar involucrarse', accion: 'carta_rechazar' },
      ],
    };
    return;
  }

  applyCardEffects(state, p.id, card);
  state.discardPile.push(card.id);
  state.pendingDecision = null;
}

/** Aplica un delta a un jugador registrando el detalle en el historial. */
function aplicarYRegistrar(
  state: GameState,
  p: ReturnType<typeof getPlayer>,
  delta: PendingDecision['opciones'][number]['efecto'],
  prefijo: string,
): void {
  if (!delta) return;
  applyDelta(p, delta);
  const detalle = Object.entries(delta)
    .map(([k, v]) => `${v !== undefined && v > 0 ? '+' : ''}${v} ${k}`)
    .join(', ');
  if (detalle) {
    const esNegativo = delta.dinero !== undefined && delta.dinero < 0;
    log(state, `${prefijo}: ${detalle}.`, esNegativo ? 'negativo' : 'positivo', p.id);
  }
}

/**
 * Resolución CENTRAL de la opción elegida de una carta.
 * Maneja costos, probabilidades, éxito/fallo, recursos e historial.
 */
export function applyCardChoice(state: GameState, decision: PendingDecision, accion: string, rng: Rng): void {
  const card = CARD_MAP[decision.cardId ?? ''];
  const p = getPlayer(state, decision.jugadorId);
  state.currentCardId = decision.cardId ?? null;

  if (accion === 'carta_rechazar') {
    log(state, `${p.nombre} evita involucrarse en "${card?.nombre ?? 'el evento'}".`, 'info', p.id);
    if (decision.cardId) state.discardPile.push(decision.cardId);
    state.pendingDecision = null;
    return;
  }
  if (accion === 'carta_guardar' && decision.cardId) {
    addCardToHand(state, p.id, decision.cardId);
    state.pendingDecision = null;
    return;
  }
  if (accion === 'carta_aceptar' && card) {
    applyCardEffects(state, p.id, card);
    state.discardPile.push(card.id);
    state.pendingDecision = null;
    return;
  }
  if (accion.startsWith('carta_opcion_') && card) {
    const idx = parseInt(accion.replace('carta_opcion_', ''), 10);
    const opcion = card.decision?.opciones[idx];
    if (opcion) {
      // 1) Verificar y aplicar costos.
      if (opcion.costoDinero && p.resources.dinero < opcion.costoDinero) {
        log(state, `${p.nombre} no tiene dinero suficiente para "${opcion.texto}".`, 'negativo', p.id);
        state.pendingDecision = null;
        return;
      }
      if (opcion.costoInfluencia && p.resources.influencia < opcion.costoInfluencia) {
        log(state, `${p.nombre} no tiene influencia suficiente para "${opcion.texto}".`, 'negativo', p.id);
        state.pendingDecision = null;
        return;
      }
      const costos: PendingDecision['opciones'][number]['efecto'] = {};
      if (opcion.costoDinero) costos.dinero = -opcion.costoDinero;
      if (opcion.costoInfluencia) costos.influencia = -opcion.costoInfluencia;
      aplicarYRegistrar(state, p, costos, `${p.nombre} decide "${opcion.texto}"`);

      // 2) Efectos fijos.
      aplicarYRegistrar(state, p, opcion.efectosFijos, `Efecto de "${opcion.texto}"`);

      // 3) Lance probabilístico real (se resuelve en el motor con el RNG de la partida).
      if (opcion.probabilidad !== undefined) {
        const prob = Math.round(opcion.probabilidad * 100);
        log(state, `${p.nombre} asume un riesgo del ${prob}%.`, 'info', p.id);
        const exito = rng.chance(opcion.probabilidad);
        if (exito) {
          aplicarYRegistrar(state, p, opcion.efectosExito, '✅ ¡Resultado exitoso!');
        } else {
          aplicarYRegistrar(state, p, opcion.efectosFallo, '❌ Resultado adverso');
        }
      } else {
        aplicarYRegistrar(state, p, opcion.efectosExito, `Resultado de "${opcion.texto}"`);
      }

      // 4) Riesgo abstracto de la carta.
      if (card.riesgo.institucional > 0 || card.riesgo.judicial > 0) {
        applyDelta(p, { riesgoInstitucional: card.riesgo.institucional, riesgoJudicial: card.riesgo.judicial });
        const detalle: string[] = [];
        if (card.riesgo.institucional > 0) detalle.push(`+${card.riesgo.institucional} riesgo institucional`);
        if (card.riesgo.judicial > 0) detalle.push(`+${card.riesgo.judicial} riesgo judicial`);
        log(state, `Carta "${card.nombre}": ${detalle.join(', ')}.`, 'info', p.id);
      }
      if (card.categoria === 'escandalo') p.stats.escandalosSufridos += 1;
      state.discardPile.push(card.id);
    }
    state.pendingDecision = null;
    return;
  }
  state.pendingDecision = null;
}

/** Contadores para la UI: mazo, descarte y mano. */
export function deckCounters(state: GameState) {
  return {
    mazo: state.deck.length,
    descarte: state.discardPile.length,
    mano: Object.values(state.hand).reduce((a, h) => a + h.length, 0),
  };
}

