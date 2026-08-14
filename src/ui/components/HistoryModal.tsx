import type { GameState } from '../../engine/types';
import { getPlayer } from '../../engine/utils';

/** Historial completo de la partida (botón 📜). */
export function HistoryModal({ state, onClose }: { state: GameState; onClose: () => void }) {
  const nombreDe = (id: string) => {
    try {
      return getPlayer(state, id).nombre;
    } catch {
      return '';
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card modal-wide" role="dialog" aria-modal="true" aria-label="Historial" onClick={(e) => e.stopPropagation()}>
        <h3>📜 Historial de la partida</h3>
        <ul className="history-list">
          {state.log.map((l, i) => (
            <li key={i} className={`history-item ${l.tipo}`}>
              <span className="history-turno">R{l.ronda} · T{l.turno}</span>
              <span className="history-actor">{nombreDe(l.jugadorId)}</span>
              <span>{l.mensaje}</span>
            </li>
          ))}
        </ul>
        <div className="actions-center">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
