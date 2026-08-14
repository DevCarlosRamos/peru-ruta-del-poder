import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameController } from '../../App';
import type { TileDef } from '../../engine/types';
import { getPlayer } from '../../engine/utils';
import { BOARD_SIZE } from '../../data/board';
import { GameBoard } from '../components/GameBoard';
import { Hud } from '../components/Hud';
import { PlayerPanel } from '../components/PlayerPanel';
import { ActionPanel } from '../components/ActionPanel';
import { ObjectivesPanel } from '../components/ObjectivesPanel';
import { CardModal } from '../components/CardModal';
import { DecisionModal } from '../components/DecisionModal';
import { InspectTileModal } from '../components/InspectTileModal';
import { MapModal } from '../components/MapModal';
import { HistoryModal } from '../components/HistoryModal';
import { RulesModal } from '../components/RulesModal';
import { PlayerHand } from '../components/PlayerHand';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { saveToCloud } from '../../api/cloudflare';
import { playSound, toggleSound, isSoundEnabled } from '../sound';

interface RollAnim {
  dado: number;
  casillas: number[];
}

/** Pantalla de partida: "mesa de juego" con el tablero como protagonista. */
export function Game({ game }: { game: GameController }) {
  const { state, advance, choose, act, playHandCard, reset, canContinue } = game;
  const [modoInspeccion, setModoInspeccion] = useState(false);
  const [inspectTile, setInspectTile] = useState<TileDef | null>(null);
  const [verMapa, setVerMapa] = useState(false);
  const [verHistorial, setVerHistorial] = useState(false);
  const [verReglas, setVerReglas] = useState(false);
  const [sonido, setSonido] = useState(isSoundEnabled());
  const [guardando, setGuardando] = useState(false);
  const [rollAnim, setRollAnim] = useState<RollAnim | null>(null);
  const posRef = useRef<number | null>(null);
  const rollPendiente = useRef(false);
  const lastPlayerRef = useRef<string | null>(null);

  if (!state) return null;
  const current = getPlayer(state, state.currentPlayerId);
  const esHumano = current.kind === 'humano';

  // Inicializa la referencia de posición.
  useEffect(() => {
    if (posRef.current === null) posRef.current = current.position;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detecta el cambio de posición tras lanzar el dado y anima el recorrido.
  useEffect(() => {
    if (lastPlayerRef.current !== current.id) {
      lastPlayerRef.current = current.id;
      posRef.current = current.position;
      return;
    }
    if (!rollPendiente.current) return;
    if (posRef.current === null || posRef.current === current.position) return;
    const antes = posRef.current;
    const despues = current.position;
    const ruta: number[] = [];
    let paso = antes;
    while (paso !== despues) {
      paso = (paso + 1) % BOARD_SIZE;
      ruta.push(paso);
    }
    const ultimo = [...state.log].reverse().find((l) => l.mensaje.includes('lanza el dado'));
    const m = ultimo?.mensaje.match(/dado:\s*(\d+)/);
    const dado = m ? Number(m[1]) : ruta.length;
    posRef.current = despues;
    rollPendiente.current = false;
    setRollAnim({ dado, casillas: ruta });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.turnoGlobal, current.position, state.log.length]);

  const lanzarDado = () => {
    rollPendiente.current = true;
    advance();
  };


  const botonTurno =
    state.phase === 'turno_inicio'
      ? 'Comenzar turno'
      : state.phase === 'roll'
        ? current.isPresident
          ? 'Gobernar el país'
          : 'Tirar el dado 🎲'
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

  const decidir = (i: number) => {
    playSound('click');
    choose(i);
  };

  const hayCarta = state.pendingDecision?.tipo === 'carta' || state.pendingDecision?.tipo === 'carta_decision';

  const finRoll = useCallback(() => setRollAnim(null), []);

  return (
    <div className="game-table">
      <header className="topbar game-topbar">
        <button className="btn btn-ghost" onClick={reset} title="Menú principal">🏠</button>
        <div className="topbar-title">
          <strong>PERÚ: LA RUTA DEL PODER</strong>
          <span className="topbar-sub">
            Ronda {state.ronda} · Turno {state.turnoGlobal} · {current.nombre} {current.isPresident && '👑'}
          </span>
        </div>
        <button className="btn btn-ghost" onClick={guardarNube} disabled={guardando} title="Guardar en la nube (D1)">☁️ {guardando ? '…' : 'Nube'}</button>
        <button className={`btn ${sonido ? 'btn-ghost' : ''}`} onClick={() => setSonido(toggleSound())} title="Sonido">🔊</button>
        <button className="btn btn-ghost" onClick={() => setVerReglas(true)} title="Reglas">📖</button>
      </header>

      <Hud state={state} />

      <div className="table-main">
        <aside className="players-rail">
          {state.players.slice().sort((a, b) => a.orden - b.orden).map((p) => (
            <PlayerPanel key={p.id} p={p} activo={p.id === current.id} />
          ))}
          <ObjectivesPanel state={state} />
        </aside>

        <main className="table-center">
          <GameBoard state={state} onInspect={setInspectTile} rollAnim={rollAnim} onRollFin={finRoll} modoInspeccion={modoInspeccion} />

          <div className="turn-bar">
            <span className="turn-fase">
              Fase: <strong>{state.phase.replace('_', ' ')}</strong>
            </span>
            {botonTurno && esHumano && (
              <button className="btn btn-primary btn-big" onClick={() => (state.phase === 'roll' && !current.isPresident ? lanzarDado() : advance())}>
                {botonTurno}
              </button>
            )}
            {canContinue && !esHumano && (
              <button className="btn btn-primary btn-big" onClick={advance}>▶ Continuar (IA)</button>
            )}
            <button
              className={`btn ${modoInspeccion ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => { setModoInspeccion((v) => !v); playSound('click'); }}
              title="Inspeccionar casillas"
            >
              🔍 Inspeccionar
            </button>
            <button className="btn btn-ghost" onClick={() => { setVerMapa(true); playSound('click'); }} title="Mapa del tablero">🗺️ Mapa</button>
            <button className="btn btn-ghost" onClick={() => { setVerHistorial(true); playSound('click'); }} title="Historial">📜 Historial</button>
          </div>

          {state.phase === 'decision' && state.pendingDecision === null && esHumano && (
            <ActionPanel state={state} onAct={act} />
          )}
        </main>
      </div>

      <PlayerHand state={state} onPlay={playHandCard} />

      {!rollAnim && hayCarta && <CardModal state={state} onChoose={decidir} />}
      {!rollAnim && state.pendingDecision && !hayCarta && <DecisionModal state={state} onChoose={decidir} />}
      {inspectTile && <InspectTileModal tile={inspectTile} onClose={() => setInspectTile(null)} />}
      {verMapa && (
        <MapModal
          board={state.board}
          onSelect={(id) => { setInspectTile(state.board[id]); setVerMapa(false); }}
          onClose={() => setVerMapa(false)}
        />
      )}
      {verHistorial && <HistoryModal state={state} onClose={() => setVerHistorial(false)} />}
      {verReglas && <RulesModal onClose={() => setVerReglas(false)} />}
      {state.config.tutorial && state.ronda === 1 && state.turnoGlobal <= 2 && !rollAnim && <TutorialOverlay />}
    </div>
  );
}

