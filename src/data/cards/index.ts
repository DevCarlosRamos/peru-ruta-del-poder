import type { CardCategory, CardDef } from '../../engine/types';
import { ECONOMY_CARDS } from './economy';
import { CRISIS_CARDS } from './crises';
import { OPPORTUNITY_CARDS } from './opportunities';
import { INVESTMENT_CARDS } from './investments';
import { NATIONAL_EVENT_CARDS, INTERNATIONAL_EVENT_CARDS } from './events';
import { SCANDAL_CARDS } from './scandals';
import { INVESTIGATION_CARDS } from './investigations';
import { ALLIANCE_CARDS } from './alliances';
import { ELECTION_CARDS } from './elections';
import { OPPOSITION_CARDS } from './opposition';
import { PROJECT_CARDS } from './projects';
import { CAMPAIGN_CARDS } from './campaign';
import { CONGRESS_CARDS } from './congress';
import { PRESIDENTIAL_CARDS } from './presidential';

/**
 * Mazo completo de "PERÚ: LA RUTA DEL PODER".
 * Organizado por categoría para escalar a 100/200 cartas sin tocar la UI.
 */
export const CARDS: CardDef[] = [
  ...OPPORTUNITY_CARDS,
  ...INVESTMENT_CARDS,
  ...CRISIS_CARDS,
  ...ELECTION_CARDS,
  ...SCANDAL_CARDS,
  ...INVESTIGATION_CARDS,
  ...ALLIANCE_CARDS,
  ...ECONOMY_CARDS,
  ...PROJECT_CARDS,
  ...OPPOSITION_CARDS,
  ...NATIONAL_EVENT_CARDS,
  ...INTERNATIONAL_EVENT_CARDS,
  ...CAMPAIGN_CARDS,
  ...CONGRESS_CARDS,
  ...PRESIDENTIAL_CARDS,
];

export const ALL_CARD_IDS: string[] = CARDS.map((card) => card.id);

/** Índice de cartas por id. */
export const CARD_MAP: Record<string, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]));

/** Mazo por categoría (robo dirigido según casilla). */
export const CARDS_BY_CATEGORY: Record<CardCategory, string[]> = (() => {
  const out: Record<string, string[]> = {};
  for (const c of CARDS) {
    (out[c.categoria] ??= []).push(c.id);
  }
  return out as Record<CardCategory, string[]>;
})();

/** Color y etiqueta visual por categoría (para cartas y tablero). */
export const CATEGORY_STYLE: Record<CardCategory, { color: string; icono: string; etiqueta: string }> = {
  oportunidad: { color: '#f1c40f', icono: '🚪', etiqueta: 'OPORTUNIDAD' },
  inversion: { color: '#27ae60', icono: '💼', etiqueta: 'INVERSIÓN' },
  crisis: { color: '#c0392b', icono: '🌩️', etiqueta: 'CRISIS' },
  eleccion: { color: '#2980b9', icono: '🗳️', etiqueta: 'ELECCIÓN' },
  escandalo: { color: '#e74c3c', icono: '💥', etiqueta: 'ESCÁNDALO' },
  investigacion: { color: '#d35400', icono: '🔎', etiqueta: 'INVESTIGACIÓN' },
  alianza: { color: '#8e44ad', icono: '🤝', etiqueta: 'ALIANZA' },
  economia: { color: '#16a085', icono: '💹', etiqueta: 'ECONOMÍA' },
  proyecto: { color: '#f39c12', icono: '🚧', etiqueta: 'PROYECTO' },
  oposicion: { color: '#95a5a6', icono: '🗣️', etiqueta: 'OPOSICIÓN' },
  evento_nacional: { color: '#8e44ad', icono: '📰', etiqueta: 'EVENTO NACIONAL' },
  evento_internacional: { color: '#2e86c1', icono: '🌎', etiqueta: 'EVENTO INTERNACIONAL' },
  campana: { color: '#e67e22', icono: '📣', etiqueta: 'CAMPAÑA' },
  congreso: { color: '#7f8c8d', icono: '🏛️', etiqueta: 'CONGRESO' },
  decision_presidencial: { color: '#212f3d', icono: '🏦', etiqueta: 'DECISIÓN PRESIDENCIAL' },
};
