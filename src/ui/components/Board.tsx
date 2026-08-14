import { useEffect, useState } from 'react';
import type { GameState } from '../../engine/types';
import { BOARD } from '../../data/board';
import { CHARACTER_MAP } from '../../data/characters';
import { getPlayer } from '../../engine/utils';

/** Tablero circular ORIGINAL "El Camino del Poder". */
export function Board({ state }: { state: GameState }) {
  const [roll, setRoll] = useState<number | null>(null);
  const N = state.board.length;
  const RADIUS = 46;
  const current = getPlayer(state, state.currentPlayerId);

  // Animación de dado: cada vez que cambia el turno global, muestro el último dado del log.
  useEffect(() => {
    const ultimo = [...state.log].reverse().find((l) => l.mensaje.includes('lanza el dado'));
    if (ultimo) {
      const m = ultimo.mensaje.match(/dado:\s*(\d+)/);
      if (m) setRoll(Number(m[1]));
    }
  }, [state.turnoGlobal, state.log.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const presidente = state.players.find((p) => p.isPresident);

  return (
    <div className="board" role="img" aria-label="Tablero circular del Camino del Poder">
      <div className="board-center">
        <div className="dice-display">
          {roll !== null ? <span className="dice-value">{roll}</span> : <span className="dice-value dice-idle">?</span>}
          <span className="dice-label">Dado</span>
        </div>
        <div className="board-center-info">
          <strong>Ronda {state.ronda}</strong>
          <span>Turno {state.turnoGlobal}</span>
          {presidente && <span className="presidente-tag">Presidente: {presidente.nombre}</span>}
        </div>
      </div>
      {state.board.map((t, i) => {
        const ang = (i / N) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + RADIUS * Math.cos(ang);
        const y = 50 + RADIUS * Math.sin(ang);
        const fichas = state.players.filter((p) => p.position === i && !p.eliminado);
        return (
          <div
            key={t.id}
            className={`tile ${i === current.position ? 'tile-current' : ''} ${
              i === 27 ? 'tile-palacio' : ''
            }`}
            style={{ left: `${x}%`, top: `${y}%`, borderColor: t.color }}
          >
            <span className="tile-icon">{t.icono}</span>
            <span className="tile-name">{t.nombre}</span>
            {fichas.length > 0 && (
              <span className="tile-tokens">
                {fichas.map((p) => (
                  <span
                    key={p.id}
                    className={`token ${p.id === current.id ? 'token-active' : ''}`}
                    style={{ background: CHARACTER_MAP[p.characterId]?.color ?? '#555' }}
                    title={p.nombre}
                  >
                    {CHARACTER_MAP[p.characterId]?.emoji ?? '🏛️'}
                  </span>
                ))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { BOARD };
