import type { GameState } from '../../engine/types';
import { getPlayer } from '../../engine/utils';

interface Props {
  state: GameState;
  onAct: (actionId: string) => void;
}

const ACCIONES: { id: string; label: string; detalle: string; costoDinero?: number; costoInfluencia?: number }[] = [
  { id: 'campana', label: '📣 Campaña', detalle: '+12 popularidad, +4 influencia', costoDinero: 10 },
  { id: 'comprar', label: '💼 Comprar activo', detalle: 'Genera ingresos pasivos por turno' },
  { id: 'proyecto', label: '🚧 Iniciar proyecto', detalle: 'Obra pública ficticia (beneficio al completar)' },
  { id: 'alianza', label: '🤝 Crear alianza', detalle: '+10 apoyo político', costoInfluencia: 12 },
  { id: 'gestion', label: '⚠️ Gestión riesgosa', detalle: '+30 S/, +riesgo institucional y judicial' },
  { id: 'defender', label: '⚖️ Defender nombre', detalle: '-6 riesgo judicial', costoDinero: 8 },
  { id: 'pagar_deuda', label: '💳 Pagar deuda', detalle: '-5 deuda por S/ 5', costoDinero: 5 },
];

/** Panel de acción opcional del turno (fase decision sin decisión pendiente). */
export function ActionPanel({ state, onAct }: Props) {
  const p = getPlayer(state, state.currentPlayerId);
  return (
    <div className="actions-panel card">
      <h4>Acción del turno (elige una o termina)</h4>
      <div className="actions-grid">
        {ACCIONES.map((a) => {
          const bloqueada =
            (a.costoDinero != null && p.resources.dinero < a.costoDinero) ||
            (a.costoInfluencia != null && p.resources.influencia < a.costoInfluencia);
          return (
            <button
              key={a.id}
              className={`btn btn-action ${bloqueada ? 'btn-disabled' : ''}`}
              disabled={bloqueada}
              onClick={() => onAct(a.id)}
            >
              <span className="action-label">{a.label}</span>
              <span className="action-detail">{a.detalle}</span>
            </button>
          );
        })}
        <button className="btn btn-skip" onClick={() => onAct('terminar')}>
          ✔ Terminar turno
        </button>
      </div>
    </div>
  );
}
