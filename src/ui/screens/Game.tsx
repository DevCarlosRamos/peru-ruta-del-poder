import { useState } from 'react';
import type { GameController } from '../../App';
import { getPlayer } from '../../engine/utils';
import { Board } from '../components/Board';
import { PlayerPanel } from '../components/PlayerPanel';
import { ActionPanel } from '../components/ActionPanel';
import { LogPanel } from '../components/LogPanel';
import { ObjectivesPanel } from '../components/ObjectivesPanel';
import { DecisionModal } from '../components/DecisionModal';
import { ElectionPanel } from '../components/ElectionPanel';
import { CardView } from '../components/CardView';
import { saveToCloud } from '../../api/cloudflare';
import { TutorialOverlay } from '../components/TutorialOverlay';

export function Game({ game }: { game: GameController }) {
  const { state, advance, choose, act, reset, goTo, canContinue } = game;
  const [guardando, setGuardando] = useState(false);
  if (!state) return null;

  const current = getPlayer(state, state.currentPlayerId);
  const esHumano = current.kind === 'humano';

  const botonTurno =
    state.phase === 'turno_inicio'
      ? 'Comenzar turno'
      : state.phase === 'roll'
        ? current.isPresident
          ? 'Gobernar el país'
          : 'Tirar el dado'
        : null;

  const guardarNube = async () => {
    setGuardando(true);
    try {
      const nombre = prompt('Nombre del guardado en la nube:', `${current.nombre} - Ronda ${state.ronda}`);
      if (!nombre) return;
      const res = await saveToCloud(state, nombre);
      alert(`Partida guardada en la nube (id: ${res.id}).`);
    } catch (e) {
      alert(`No se pudo guardar en la nube: ${e instanceof Error ? e.message : 'error'}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="game-screen">
      <header className="topbar game-topbar">
        <button className="btn btn-ghost" onClick={reset} title="Menú principal">
          🏠
        </button>
        <div className="topbar-title">
          <strong>PERÚ: LA RUTA DEL PODER</strong>
          <span className="topbar-sub">
            Ronda {state.ronda} · Turno {state.turnoGlobal} · {current.nombre} {current.isPresident && '👑'}
          </span>
        </div>
        <button className="btn btn-ghost" onClick={guardarNube} disabled={guardando} title="Guardar en la nube (D1)">
          ☁️ {guardando ? '…' : 'Nube'}
        </button>
        <button className="btn btn-ghost" onClick={() => goTo('rules')} title="Reglas">
          📜
        </button>
      </header>

      <div className="game-layout">
        <aside className="col-players">
          {state.players
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .map((p) => (
              <PlayerPanel key={p.id} p={p} activo={p.id === current.id} />
            ))}
          <ObjectivesPanel state={state} />
        </aside>

        <main className="col-board">
          <Board state={state} />
          <div className="turn-controls">
            {botonTurno && esHumano && (
              <button className="btn btn-primary btn-big" onClick={advance}>
                {botonTurno}
              </button>
            )}
            {canContinue && !esHumano && (
              <button className="btn btn-primary btn-big" onClick={advance}>
                ▶ Continuar (IA)
              </button>
            )}
            {state.phase === 'decision' && state.pendingDecision === null && esHumano && (
              <ActionPanel state={state} onAct={act} />
            )}
          </div>
          <ElectionPanel state={state} />
        </main>

        <aside className="col-log">
          <LogPanel state={state} />
          <CardView cardId={state.currentCardId} />
        </aside>
      </div>

      {state.pendingDecision && <DecisionModal state={state} onChoose={choose} />}
      {state.config.tutorial && state.ronda === 1 && state.turnoGlobal <= 2 && <TutorialOverlay />}
    </div>
  );
}
