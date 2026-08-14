import type { GameController } from '../../App';
import { getPlayer, formatMoney } from '../../engine/utils';
import { computeFinalScores } from '../../engine/score';
import { CHARACTER_MAP } from '../../data/characters';

const MOTIVOS: Record<string, string> = {
  mandato_completo: 'Completó su mandato con respaldo popular. 🏛️',
  objetivos: 'Cumplió todos sus Objetivos de Poder. 🎯',
  puntuacion: 'Terminó con la mayor puntuación. 📊',
};

export function Result({ game }: { game: GameController }) {
  const { state, reset, goTo } = game;
  if (!state || !state.winner) return null;
  const ganador = getPlayer(state, state.winner.playerId);
  const char = CHARACTER_MAP[ganador.characterId];
  const scores = computeFinalScores(state);

  return (
    <div className="screen result">
      <div className="result-hero card">
        <span className="result-trophy">🏆</span>
        <h2>Gana {ganador.nombre}</h2>
        <p className="result-sub">{char?.nombre} · {MOTIVOS[state.winner.motivo] ?? 'Victoria'}</p>
        <p className="result-points">{state.winner.puntos} puntos</p>
        <div className="result-actions">
          <button className="btn btn-primary" onClick={() => goTo('newgame')}>
            ▶ Nueva partida
          </button>
          <button className="btn btn-ghost" onClick={reset}>
            ← Menú principal
          </button>
        </div>
      </div>

      <div className="content">
        <div className="card">
          <h3>Ranking final</h3>
          <table className="ranking">
            <thead>
              <tr>
                <th>#</th>
                <th>Jugador</th>
                <th>Personaje</th>
                <th>Dinero</th>
                <th>Popularidad</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => {
                const p = getPlayer(state, s.playerId);
                return (
                  <tr key={p.id} className={p.id === ganador.id ? 'row-winner' : ''}>
                    <td>{i + 1}</td>
                    <td>{p.nombre}</td>
                    <td>{CHARACTER_MAP[p.characterId]?.nombre}</td>
                    <td>{formatMoney(p.resources.dinero)}</td>
                    <td>{p.resources.popularidad}</td>
                    <td><strong>{s.puntos}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
