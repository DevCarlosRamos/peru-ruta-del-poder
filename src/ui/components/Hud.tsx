import type { GameState } from '../../engine/types';
import { getPlayer } from '../../engine/utils';
import { CHARACTER_MAP } from '../../data/characters';

function Chip({ icono, etiqueta, valor, color }: { icono: string; etiqueta: string; valor: number; color: string }) {
  return (
    <div className="hud-chip" title={`${etiqueta}: ${valor}`}>
      <span className="hud-icon">{icono}</span>
      <span className="hud-val" style={{ color }}>{valor}</span>
      <span className="hud-label">{etiqueta}</span>
    </div>
  );
}

/** HUD compacto con los recursos del jugador activo. */
export function Hud({ state }: { state: GameState }) {
  const p = getPlayer(state, state.currentPlayerId);
  const char = CHARACTER_MAP[p.characterId];
  const riesgo = Math.max(p.resources.riesgoInstitucional, p.resources.riesgoJudicial);
  return (
    <div className="hud">
      <div className="hud-player">
        <span className="hud-avatar" style={{ background: char?.color }}>{char?.emoji ?? '🏛️'}</span>
        <div className="hud-name">
          <strong>{p.nombre}</strong>
          <span className="hud-sub">
            {char?.nombre} {p.isPresident && '· 👑 PRESIDENTE'} {p.kind === 'ia' && '· IA'}
          </span>
        </div>
        <div className="hud-turno">
          <span className="badge">Ronda {state.ronda}</span>
          <span className="badge">Turno {state.turnoGlobal}</span>
        </div>
      </div>
      <div className="hud-chips">
        <Chip icono="💰" etiqueta="Dinero" valor={p.resources.dinero} color="#9ee6b8" />
        <Chip icono="⭐" etiqueta="Popularidad" valor={p.resources.popularidad} color="#27ae60" />
        <Chip icono="🏛️" etiqueta="Influencia" valor={p.resources.influencia} color="#2980b9" />
        <Chip icono="👑" etiqueta="Poder" valor={p.resources.poder} color="#8e44ad" />
        <Chip icono="🤝" etiqueta="Apoyo" valor={p.resources.apoyoPolitico} color="#16a085" />
        <Chip icono="⚠️" etiqueta="Riesgo" valor={riesgo} color={riesgo > 60 ? '#ff6b5b' : riesgo > 30 ? '#e67e22' : '#c9d1d9'} />
        <Chip icono="📊" etiqueta="Activos" valor={p.assets.length} color="#f1c40f" />
        <Chip icono="💳" etiqueta="Deuda" valor={p.resources.deuda} color="#ff9e93" />
      </div>
    </div>
  );
}
