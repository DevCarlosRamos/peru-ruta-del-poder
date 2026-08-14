import type { Player } from '../../engine/types';
import { CHARACTER_MAP } from '../../data/characters';
import { formatMoney } from '../../engine/utils';

function Bar({ etiqueta, valor, color }: { etiqueta: string; valor: number; color: string }) {
  return (
    <div className="rbar" title={`${etiqueta}: ${valor}`}>
      <span className="rbar-label">{etiqueta}</span>
      <div className="rbar-track">
        <div className="rbar-fill" style={{ width: `${Math.max(0, Math.min(100, valor))}%`, background: color }} />
      </div>
      <span className="rbar-value">{valor}</span>
    </div>
  );
}

/** Tarjeta de un jugador con sus recursos clave. */
export function PlayerPanel({ p, activo }: { p: Player; activo: boolean }) {
  const char = CHARACTER_MAP[p.characterId];
  return (
    <div className={`player-card ${activo ? 'player-active' : ''} ${p.isPresident ? 'player-president' : ''}`}>
      <div className="player-head">
        <span className="player-emoji" style={{ background: char?.color }}>
          {char?.emoji ?? '🏛️'}
        </span>
        <div className="player-title">
          <strong>{p.nombre}</strong>
          <span className="player-sub">
            {char?.nombre}
            {p.isPresident && ' · 👑 PRESIDENTE'}
            {p.kind === 'ia' && ' · IA'}
          </span>
        </div>
      </div>
      <div className="player-money">
        <span className="money">{formatMoney(p.resources.dinero)}</span>
        {p.resources.deuda > 0 && <span className="deuda">Deuda {p.resources.deuda}</span>}
      </div>
      <Bar etiqueta="Popularidad" valor={p.resources.popularidad} color="#27ae60" />
      <Bar etiqueta="Influencia" valor={p.resources.influencia} color="#2980b9" />
      <Bar etiqueta="Poder" valor={p.resources.poder} color="#8e44ad" />
      <Bar etiqueta="Apoyo" valor={p.resources.apoyoPolitico} color="#16a085" />
      <Bar etiqueta="R. Institucional" valor={p.resources.riesgoInstitucional} color="#e67e22" />
      <Bar etiqueta="R. Judicial" valor={p.resources.riesgoJudicial} color="#c0392b" />
      {p.objectives.length > 0 && (
        <div className="player-objectives-mini">
          <span>🎯 Objetivos: {p.objectivesCompleted.length}/{p.objectives.length}</span>
        </div>
      )}
    </div>
  );
}
