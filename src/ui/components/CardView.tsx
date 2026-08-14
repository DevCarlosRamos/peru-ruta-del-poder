import type { CardDef } from '../../engine/types';
import { CARD_MAP } from '../../data/cards';

const TAG_STYLE: Record<CardDef['tag'], string> = {
  HISTORICO: 'tag-historico',
  INVESTIGACION: 'tag-investigacion',
  FICCION: 'tag-ficcion',
  SATIRA: 'tag-satira',
};

/** Vista de la carta actual del juego (mazo). */
export function CardView({ cardId }: { cardId: string | null }) {
  if (!cardId) return null;
  const card = CARD_MAP[cardId];
  if (!card) return null;
  return (
    <div className={`card card-view ${TAG_STYLE[card.tag] ?? ''}`}>
      <div className="card-view-head">
        <span className="badge">{card.tag}</span>
        <span className="badge badge-rare">{card.rareza}</span>
      </div>
      <h4>{card.nombre}</h4>
      <p className="card-textoCorto">{card.textoCorto}</p>
      <p className="card-descripcion">{card.descripcion}</p>
      <p className="hint">Contexto: {card.contexto}</p>
      {card.requiereVerificacion && <p className="badge badge-warn">⚠ {card.requiereVerificacion}</p>}
    </div>
  );
}
