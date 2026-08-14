import type { GameState } from '../../engine/types';
import { getPlayer } from '../../engine/utils';

interface Props {
  state: GameState;
  onChoose: (index: number) => void;
}

/** Modal de decisión pendiente (casillas, cartas, vacancia, campañas...). */
export function DecisionModal({ state, onChoose }: Props) {
  const d = state.pendingDecision;
  if (!d) return null;
  const p = getPlayer(state, d.jugadorId);

  return (
    <div className="modal-overlay">
      <div className="modal card" role="dialog" aria-modal="true" aria-label={d.titulo}>
        <h3>{d.titulo}</h3>
        <p className="modal-desc">{d.descripcion}</p>
        {d.tipo === 'vacancia' && <p className="badge badge-crisis">⚠️ Crisis institucional</p>}
        {d.tipo === 'carta' || d.tipo === 'carta_decision' ? (
          <p className="modal-tag">{p.nombre} debe decidir sobre esta carta.</p>
        ) : null}
        <div className="modal-options">
          {d.opciones.map((o, i) => {
            const sinDinero = o.requiereDinero != null && p.resources.dinero < o.requiereDinero;
            const sinInfluencia = o.requiereInfluencia != null && p.resources.influencia < o.requiereInfluencia;
            const bloqueada = sinDinero || sinInfluencia;
            return (
              <button
                key={i}
                className={`btn btn-option ${bloqueada ? 'btn-disabled' : ''}`}
                disabled={bloqueada}
                onClick={() => onChoose(i)}
              >
                <span>{o.texto}</span>
                {sinDinero && <em className="btn-note">(sin dinero)</em>}
                {sinInfluencia && <em className="btn-note">(sin influencia)</em>}
              </button>
            );
          })}
        </div>
        {d.tipo === 'carta' && <p className="hint">Carta de juego: sus efectos son mecánicos.</p>}
      </div>
    </div>
  );
}
