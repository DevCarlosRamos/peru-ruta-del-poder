import { useState } from 'react';
import type { GameController } from '../../App';
import type { PlayerKind } from '../../engine/types';
import { CHARACTERS } from '../../data/characters';
import { AI_PROFILE_NAMES } from '../../data/aiProfiles';
import { seedFromString } from '../../engine/rng';
import type { RosterEntry } from '../../engine/gameEngine';

interface Slot {
  nombre: string;
  kind: PlayerKind;
  aiProfile: string;
  characterId: string;
}

export function NewGame({ game }: { game: GameController }) {
  const [playerCount, setPlayerCount] = useState(2);
  const [tutorial, setTutorial] = useState(true);
  const [nombrePartida, setNombrePartida] = useState('');
  const [slots, setSlots] = useState<Slot[]>([
    { nombre: '', kind: 'humano', aiProfile: 'oportunista', characterId: 'garcia' },
    { nombre: '', kind: 'humano', aiProfile: 'negociador', characterId: 'vizcarra' },
    { nombre: '', kind: 'ia', aiProfile: 'populista', characterId: 'castillo' },
    { nombre: '', kind: 'ia', aiProfile: 'economico', characterId: 'ppk' },
  ]);

  const activos = slots.slice(0, playerCount);
  const usados = new Set(activos.map((s) => s.characterId));

  const updateSlot = (i: number, patch: Partial<Slot>) => {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const empezar = () => {
    const seed = seedFromString(nombrePartida || `partida_${Date.now()}`);
    const roster: RosterEntry[] = activos.map((s, i) => ({
      nombre: s.nombre.trim() || `Jugador ${i + 1}`,
      kind: s.kind,
      aiProfile: s.kind === 'ia' ? (s.aiProfile as RosterEntry['aiProfile']) : undefined,
      characterId: s.characterId,
    }));
    game.startGame(
      {
        seed,
        seedLabel: nombrePartida || 'partida',
        maxRounds: 18,
        playerCount,
        tutorial,
        ai: activos.some((s) => s.kind === 'ia'),
      },
      roster,
    );
  };

  return (
    <div className="screen">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => game.goTo('home')}>
          ← Inicio
        </button>
        <h2 className="topbar-title">Nueva partida</h2>
        <span className="topbar-spacer" />
      </header>

      <main className="content">
        <section className="card">
          <h3>Configuración de la mesa</h3>
          <div className="form-row">
            <label>
              Nombre de partida (opcional)
              <input
                value={nombrePartida}
                onChange={(e) => setNombrePartida(e.target.value)}
                placeholder="Ej: La gran coalición"
                maxLength={40}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Jugadores
              <select value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))}>
                <option value={2}>2 jugadores</option>
                <option value={3}>3 jugadores</option>
                <option value={4}>4 jugadores</option>
              </select>
            </label>
            <label className="check">
              <input type="checkbox" checked={tutorial} onChange={(e) => setTutorial(e.target.checked)} />
              Tutorial del primer turno
            </label>
          </div>
        </section>

        <section className="card">
          <h3>Jugadores y personajes</h3>
          <p className="hint">
            Cada personaje es una pieza satírica de juego con estadísticas de gameplay, no una
            evaluación histórica.
          </p>
          <div className="roster">
            {activos.map((s, i) => (
              <div className="roster-slot" key={i}>
                <div className="roster-head">
                  <strong>Jugador {i + 1}</strong>
                  <select
                    value={s.kind}
                    onChange={(e) =>
                      updateSlot(i, { kind: e.target.value as PlayerKind })
                    }
                  >
                    <option value="humano">Humano</option>
                    <option value="ia">IA</option>
                  </select>
                </div>
                <input
                  placeholder="Nombre"
                  value={s.nombre}
                  onChange={(e) => updateSlot(i, { nombre: e.target.value })}
                  maxLength={20}
                />
                <div className="roster-char">
                  <span className="char-emoji">
                    {CHARACTERS.find((c) => c.id === s.characterId)?.emoji}
                  </span>
                  <select
                    value={s.characterId}
                    onChange={(e) => updateSlot(i, { characterId: e.target.value })}
                  >
                    {CHARACTERS.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.id !== s.characterId && usados.has(c.id)}>
                        {c.nombre} — {c.periodo}
                      </option>
                    ))}
                  </select>
                </div>
                {s.kind === 'ia' && (
                  <select value={s.aiProfile} onChange={(e) => updateSlot(i, { aiProfile: e.target.value })}>
                    {AI_PROFILE_NAMES.map((p) => (
                      <option key={p} value={p}>
                        Perfil: {p}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="actions-center">
          <button className="btn btn-primary btn-big" onClick={empezar}>
            🗳️ Comenzar la campaña
          </button>
        </div>
      </main>
    </div>
  );
}
