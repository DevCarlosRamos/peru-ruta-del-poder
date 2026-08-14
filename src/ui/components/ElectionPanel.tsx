import type { GameState } from '../../engine/types';
import { getPlayer } from '../../engine/utils';

/** Estado de las elecciones nacionales. */
export function ElectionPanel({ state }: { state: GameState }) {
  const e = state.election;
  if (e.fase === 'inactiva') return null;
  return (
    <div className="card election-panel">
      <h4>🗳️ Jornada electoral</h4>
      {e.fase === 'campaña' && <p>La campaña está en marcha: los candidatos deciden su financiamiento.</p>}
      {e.fase === 'primera_vuelta' && <p>Contando la primera vuelta…</p>}
      {e.fase === 'segunda_vuelta' && (
        <p>Segunda vuelta entre {e.finalistas.map((id) => getPlayer(state, id).nombre).join(' y ')}.</p>
      )}
      {e.resultadosPrimeraVuelta.length > 0 && (
        <ul className="election-results">
          {e.resultadosPrimeraVuelta.map((r) => (
            <li key={r.playerId}>
              {getPlayer(state, r.playerId).nombre}: <strong>{r.votos}</strong> votos
              {e.finalistas.includes(r.playerId) ? ' ⭐' : ''}
            </li>
          ))}
        </ul>
      )}
      {e.fase === 'resultado' && e.ganadorId && (
        <p className="eleccion-ganador">
          🎉 Gana {getPlayer(state, e.ganadorId).nombre}: ¡asume la presidencia!
        </p>
      )}
    </div>
  );
}
