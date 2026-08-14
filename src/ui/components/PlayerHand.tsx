import type { GameState } from '../../engine/types';
import { getPlayer } from '../../engine/utils';
import { CARD_MAP, CATEGORY_STYLE } from '../../data/cards';

/** Mano de cartas del jugador actual (barra inferior). */
export function PlayerHand({ state, onPlay }: { state: GameState; onPlay: (cardId: string) => void }) {
  const p = getPlayer(state, state.currentPlayerId);
  const mano = state.hand[p.id] ?? [];
  if (mano.length === 0) return null;
  return (
    <div className="hand-bar">
      <span className="hand-label">✋ Mano de {p.nombre}</span>
      <div className="hand-cards">
        {mano.map((id) => {
          const card = CARD_MAP[id];
          if (!card) return null;
          const estilo = CATEGORY_STYLE[card.categoria];
          return (
            <button key={id} className="hand-card" style={{ borderColor: estilo.color }} onClick={() => onPlay(id)} title={card.nombre}>
              <span className="hand-card-icon">{estilo.icono}</span>
              <span className="hand-card-nombre">{card.nombre}</span>
              <span className="hand-card-tipo">{estilo.etiqueta}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
