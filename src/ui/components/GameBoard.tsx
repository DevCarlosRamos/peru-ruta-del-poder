import { useRef, useState } from 'react';
import type { GameState, TileDef } from '../../engine/types';
import { getPlayer } from '../../engine/utils';
import { CHARACTER_MAP } from '../../data/characters';
import { BOARD_LAYOUT, slotToPercent } from '../../data/boardLayout';
import { deckCounters } from '../../engine/cards';
import { CATEGORY_STYLE } from '../../data/cards';

interface Props {
  state: GameState;
  onInspect: (tile: TileDef) => void;
  modoInspeccion: boolean;
}

const TILE_KIND_LABEL: Record<string, string> = {
  salida: 'SALIDA', campana: 'CAMPAÑA', congreso: 'CONGRESO', region: 'REGIÓN',
  proyecto: 'PROYECTO', inversion: 'INVERSIÓN', crisis: 'CRISIS', investigacion: 'INVESTIGACIÓN',
  escandalo: 'ESCÁNDALO', tribunal: 'TRIBUNAL', medios: 'MEDIOS', alianza: 'ALIANZA',
  oposicion: 'OPOSICIÓN', economia: 'ECONOMÍA', evento_nacional: 'EVENTO NACIONAL',
  evento_internacional: 'EVENTO INTERNACIONAL', oportunidad: 'OPORTUNIDAD', riesgo: 'RIESGO',
  elecciones: 'ELECCIONES', palacio: 'PALACIO',
};

/**
 * Tablero "El Camino del Poder" en rejilla serpentina con zoom/pan, tooltips
 * e inspección. El dado se muestra como un número estático (sin animación).
 */
export function GameBoard({ state, onInspect, modoInspeccion }: Props) {
  const current = getPlayer(state, state.currentPlayerId);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<{ tile: TileDef; x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const contadores = deckCounters(state);

  // Número del último dado del jugador actual (se muestra "como si acabara de salir").
  const ultimoDado = (() => {
    for (let i = state.log.length - 1; i >= 0; i--) {
      const l = state.log[i];
      if (l.jugadorId === current.id && l.mensaje.includes('lanza el dado')) {
        const m = l.mensaje.match(/dado:\s*(\d+)/);
        if (m) return Number(m[1]);
      }
    }
    return null;
  })();

  const zoomEn = (delta: number) => setZoom((z) => Math.max(0.45, Math.min(2.2, z + delta)));
  const centrar = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const ajustar = () => { setZoom(0.8); setPan({ x: 0, y: 0 }); };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.tile-box')) return;
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPan({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y });
  };
  const onPointerUp = () => { drag.current = null; };

  const hover = (t: TileDef, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ tile: t, x: rect.left + rect.width / 2, y: rect.top - 6 });
  };

  return (
    <div className="board-area">
      <div className="board-toolbar">
        <span className="toolbar-title">🗺️ El Camino del Poder</span>
        <div className="toolbar-actions">
          <button className="btn btn-ghost" onClick={() => zoomEn(0.15)} title="Zoom +">＋</button>
          <button className="btn btn-ghost" onClick={() => zoomEn(-0.15)} title="Zoom −">−</button>
          <button className="btn btn-ghost" onClick={centrar} title="Centrar">◎</button>
          <button className="btn btn-ghost" onClick={ajustar} title="Ajustar a pantalla">⛶</button>
        </div>
      </div>
      <div className="board-viewport" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <div className="board-grid" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <div className="board-title">LA RUTA DEL PODER</div>
          <div className="board-deck">
            <span className="deck-counter" title="Mazo">🃏 {contadores.mazo}</span>
            <span className="deck-counter" title="Descarte">🗑️ {contadores.descarte}</span>
            <span className="deck-counter" title="Cartas en manos">✋ {contadores.mano}</span>
          </div>
          {ultimoDado !== null && (
            <div className="dice-static" key={`d${state.turnoGlobal}-${ultimoDado}`} title="Último dado">
              <span className="dice-face">{ultimoDado}</span>
            </div>
          )}

          {state.board.map((t, i) => {
            const slot = BOARD_LAYOUT[i];
            const { x, y } = slotToPercent(slot);
            const fichas = state.players.filter((pl) => pl.position === i && !pl.eliminado);
            const estilo = CATEGORY_STYLE[t.cartas?.[0] as keyof typeof CATEGORY_STYLE] ?? { color: t.color, icono: t.icono };
            return (
              <div
                key={t.id}
                className={`tile-box ${i === current.position ? 'tile-current' : ''} ${modoInspeccion ? 'tile-inspectable' : ''}`}
                style={{ left: `${x}%`, top: `${y}%`, borderColor: estilo.color }}
                onMouseEnter={(e) => hover(t, e)}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => onInspect(t)}
              >
                <span className="tile-num">{i}</span>
                <span className="tile-ico">{t.icono}</span>
                <span className="tile-nombre">{t.nombre}</span>
                <span className="tile-tipo">{TILE_KIND_LABEL[t.kind] ?? t.kind}</span>
                {fichas.length > 0 && (
                  <span className="tile-fichas">
                    {fichas.map((pl) => (
                      <span
                        key={pl.id}
                        className={`ficha ${pl.id === current.id ? 'ficha-active' : ''}`}
                        style={{ background: CHARACTER_MAP[pl.characterId]?.color ?? '#555' }}
                        title={pl.nombre}
                      >
                        {CHARACTER_MAP[pl.characterId]?.emoji ?? '🏛️'}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {tooltip && (
          <div className="tile-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <strong>CASILLA {tooltip.tile.id} · {tooltip.tile.nombre}</strong>
            <p>{tooltip.tile.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

