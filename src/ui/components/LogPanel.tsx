import type { GameState } from '../../engine/types';

const CLASE = {
  info: 'log-info',
  positivo: 'log-positivo',
  negativo: 'log-negativo',
  crisis: 'log-crisis',
  eleccion: 'log-eleccion',
  sistema: 'log-sistema',
} as const;

/** Historial de eventos de la partida. */
export function LogPanel({ state }: { state: GameState }) {
  const recientes = [...state.log].slice(-60).reverse();
  return (
    <div className="card log">
      <h4>📰 Crónica política</h4>
      <ul className="log-list">
        {recientes.map((l, i) => (
          <li key={`${l.turno}-${i}`} className={`log-item ${CLASE[l.tipo] ?? ''}`}>
            <span className="log-turno">R{l.ronda}</span>
            <span>{l.mensaje}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
