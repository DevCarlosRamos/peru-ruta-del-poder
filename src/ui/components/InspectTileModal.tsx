import type { TileDef } from '../../engine/types';
import { CATEGORY_STYLE } from '../../data/cards';

const TILE_KIND_LABEL: Record<string, string> = {
  salida: 'SALIDA', campana: 'CAMPAÑA', congreso: 'CONGRESO', region: 'REGIÓN',
  proyecto: 'PROYECTO', inversion: 'INVERSIÓN', crisis: 'CRISIS', investigacion: 'INVESTIGACIÓN',
  escandalo: 'ESCÁNDALO', tribunal: 'TRIBUNAL', medios: 'MEDIOS', alianza: 'ALIANZA',
  oposicion: 'OPOSICIÓN', economia: 'ECONOMÍA', evento_nacional: 'EVENTO NACIONAL',
  evento_internacional: 'EVENTO INTERNACIONAL', oportunidad: 'OPORTUNIDAD', riesgo: 'RIESGO',
  elecciones: 'ELECCIONES', palacio: 'PALACIO',
};

/** Modal de inspección de una casilla (INFO BAJO DEMANDA). */
export function InspectTileModal({ tile, onClose }: { tile: TileDef | null; onClose: () => void }) {
  if (!tile) return null;
  const estilo = CATEGORY_STYLE[tile.cartas?.[0] as keyof typeof CATEGORY_STYLE] ?? { color: tile.color, icono: tile.icono };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" role="dialog" aria-modal="true" aria-label={tile.nombre} onClick={(e) => e.stopPropagation()}>
        <div className="inspect-head" style={{ borderColor: estilo.color }}>
          <span className="inspect-icon">{tile.icono}</span>
          <div>
            <span className="badge">CASILLA {tile.id}</span>
            <h3>{tile.nombre}</h3>
            <span className="hint">{TILE_KIND_LABEL[tile.kind] ?? tile.kind}</span>
          </div>
        </div>
        <p className="modal-desc">{tile.descripcion}</p>

        {tile.recompensas && tile.recompensas.length > 0 && (
          <div className="inspect-section">
            <h5>✅ Posibles recompensas</h5>
            <ul>{tile.recompensas.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        )}
        {tile.riesgos && tile.riesgos.length > 0 && (
          <div className="inspect-section">
            <h5>⚠️ Posibles riesgos</h5>
            <ul>{tile.riesgos.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        )}
        {tile.decisiones && tile.decisiones.length > 0 && (
          <div className="inspect-section">
            <h5>🎲 Decisiones disponibles</h5>
            <ul>{tile.decisiones.map((d) => <li key={d}>{d}</li>)}</ul>
          </div>
        )}
        {tile.cartas && tile.cartas.length > 0 && (
          <div className="inspect-section">
            <h5>🃏 Cartas asociadas</h5>
            <div className="inspect-cartas">
              {tile.cartas.map((cat) => (
                <span key={cat} className="badge" style={{ borderColor: CATEGORY_STYLE[cat].color, color: CATEGORY_STYLE[cat].color }}>
                  {CATEGORY_STYLE[cat].icono} {CATEGORY_STYLE[cat].etiqueta}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="actions-center">
          <button className="btn btn-primary" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  );
}
