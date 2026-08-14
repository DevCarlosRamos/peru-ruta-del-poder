import type { CardCategory, CardDef, GameState, PendingDecision } from './types';
import { applyDelta, getPlayer, log } from './utils';
import { CARDS_BY_CATEGORY, CARD_MAP } from '../data/cards';
import { Rng } from './rng';

/**
 * Mazo del motor: robo dirigido por categoría y resolución de cartas.
 */

/** Roba una carta de una categoría evitando repetir las que están en juego. */
export function drawCard(state: GameState, categoria: CardCategory, rng: Rng): CardDef | null {
  const ids = CARDS_BY_CATEGORY[categoria] ?? [];
  if (ids.length === 0) return null;
  const disponibles = ids.filter((id) => !state.drawPile.includes(id));
  const pool = disponibles.length > 0 ? disponibles : ids;
  const id = rng.pick(pool);
  state.drawPile.push(id);
  return CARD_MAP[id];
}

/** Determina si una carta tiene mezcla de beneficio y costo (decisiones aceptar/rechazar). */
function tieneMezcla(card: CardDef): boolean {
  const valores = Object.values(card.efectos);
  const positivo = valores.some((v) => v > 0);
  const negativo = valores.some((v) => v < 0) || card.riesgo.institucional + card.riesgo.judicial > 0;
  return positivo && negativo;
}

/** Aplica los efectos y riesgos de una carta a un jugador. */
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

/**
 * Resuelve una carta:
 * - Con `decision`: el jugador elige entre las opciones (+ rechazar).
 * - Con mezcla beneficio/costo: aceptar o rechazar.
 * - De otro modo: se aplica automáticamente.
 */
export function resolveCard(state: GameState, card: CardDef, jugadorId?: string): void {
  const p = getPlayer(state, jugadorId ?? state.currentPlayerId);
  state.currentCardId = card.id;
  state.drawPile = state.drawPile.filter((id) => id !== card.id);
  state.discardPile.push(card.id);

  if (card.decision) {
    const opciones: PendingDecision['opciones'] = card.decision.opciones.map((o, i) => ({
      texto: o.texto,
      efecto: o.efectos,
      accion: `carta_opcion_${i}`,
    }));
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
  state.pendingDecision = null;
}

/** Aplica la opción elegida de una carta. */
export function applyCardChoice(state: GameState, decision: PendingDecision, accion: string): void {
  const card = CARD_MAP[decision.cardId ?? ''];
  const p = getPlayer(state, decision.jugadorId);
  state.currentCardId = decision.cardId ?? null;

  if (accion === 'carta_rechazar') {
    log(state, `${p.nombre} evita involucrarse en "${card?.nombre ?? 'el evento'}".`, 'info', p.id);
    state.pendingDecision = null;
    return;
  }
  if (accion === 'carta_aceptar' && card) {
    applyCardEffects(state, p.id, card);
    state.pendingDecision = null;
    return;
  }
  if (accion.startsWith('carta_opcion_') && card?.decision) {
    const idx = parseInt(accion.replace('carta_opcion_', ''), 10);
    const opcion = card.decision.opciones[idx];
    if (opcion) {
      applyDelta(p, opcion.efectos);
      applyDelta(p, { riesgoInstitucional: card.riesgo.institucional, riesgoJudicial: card.riesgo.judicial });
      if (card.categoria === 'escandalo') p.stats.escandalosSufridos += 1;
      const detalle = Object.entries(opcion.efectos)
        .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k}`)
        .join(', ');
      log(state, `Carta "${card.nombre}": eliges "${opcion.texto}" (${detalle}).`, 'info', p.id);
    }
    state.pendingDecision = null;
    return;
  }
  state.pendingDecision = null;
}
