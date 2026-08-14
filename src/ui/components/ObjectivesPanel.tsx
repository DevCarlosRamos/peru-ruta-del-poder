import type { GameState } from '../../engine/types';
import { getPlayer } from '../../engine/utils';
import { OBJECTIVE_MAP } from '../../data/objectives';

/** Objetivos de Poder del jugador actual. */
export function ObjectivesPanel({ state }: { state: GameState }) {
  const p = getPlayer(state, state.currentPlayerId);
  if (p.objectives.length === 0) return null;
  return (
    <div className="card objectives">
      <h4>🎯 Objetivos de Poder de {p.nombre}</h4>
      <ul className="objectives-list">
        {p.objectives.map((oid) => {
          const def = OBJECTIVE_MAP[oid];
          const hecho = p.objectivesCompleted.includes(oid);
          return (
            <li key={oid} className={hecho ? 'objective-done' : ''}>
              <span className="objective-check">{hecho ? '✅' : '⬜'}</span>
              <span>
                <strong>{def?.titulo}</strong> — {def?.descripcion}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="hint">Cumple ambos objetivos y ganas la partida.</p>
    </div>
  );
}
