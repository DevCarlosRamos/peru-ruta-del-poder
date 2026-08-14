import type { TileDef } from '../../engine/types';

/** Mapa completo del tablero: todas las casillas legibles de una vez. */
export function MapModal({
  board,
  onSelect,
  onClose,
}: {
  board: TileDef[];
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card modal-wide" role="dialog" aria-modal="true" aria-label="Mapa del tablero" onClick={(e) => e.stopPropagation()}>
        <h3>🗺️ Mapa del Camino del Poder</h3>
        <p className="hint">Haz clic en una casilla para inspeccionarla. El tablero se centrará en ella.</p>
        <div className="map-grid">
          {board.map((t) => (
            <button key={t.id} className="map-item" style={{ borderColor: t.color }} onClick={() => onSelect(t.id)}>
              <span className="map-num">{String(t.id).padStart(2, '0')}</span>
              <span className="map-ico">{t.icono}</span>
              <span className="map-nombre">{t.nombre}</span>
            </button>
          ))}
        </div>
        <div className="actions-center">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
