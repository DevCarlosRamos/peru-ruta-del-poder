import type { GameController } from '../../App';
import { getPlayer, formatMoney } from '../../engine/utils';
import { computeFinalScores } from '../../engine/score';
import { CHARACTER_MAP } from '../../data/characters';
import { OBJECTIVE_MAP } from '../../data/objectives';
import { playSound } from '../sound';
import { useEffect } from 'react';

const MOTIVOS: Record<string, string> = {
  mandato_completo: 'Completó su mandato con respaldo popular.',
  objetivos: 'Cumplió todos sus Objetivos de Poder.',
  puntuacion: 'Terminó con la mayor puntuación.',
};

/** Desglose de puntuación por recurso. */
function desglosePuntos(p: ReturnType<typeof getPlayer>) {
  const r = p.resources;
  return [
    { etiqueta: 'Dinero', valor: Math.round(r.dinero / 10) },
    { etiqueta: 'Influencia', valor: r.influencia },
    { etiqueta: 'Popularidad', valor: r.popularidad },
    { etiqueta: 'Poder', valor: Math.round(r.poder * 1.5) },
    { etiqueta: 'Apoyo político', valor: Math.round(r.apoyoPolitico * 0.5) },
    { etiqueta: 'Activos', valor: p.assets.length * 5 },
    { etiqueta: 'Proyectos completados', valor: p.stats.proyectosCompletados * 15 },
    { etiqueta: 'Objetivos', valor: p.objectivesCompleted.length * 25 },
    { etiqueta: 'Deuda', valor: -r.deuda * 2 },
    { etiqueta: 'Riesgo institucional', valor: -r.riesgoInstitucional },
    { etiqueta: 'Riesgo judicial', valor: -r.riesgoJudicial * 2 },
  ].filter((x) => x.valor !== 0);
}

export function Result({ game }: { game: GameController }) {
  const { state, reset, goTo } = game;
  useEffect(() => {
    if (state?.winner) playSound('victoria');
  }, [state?.winner]);
  if (!state || !state.winner) return null;
  const ganador = getPlayer(state, state.winner.playerId);
  const char = CHARACTER_MAP[ganador.characterId];
  const scores = computeFinalScores(state);
  const detalle = desglosePuntos(ganador);
  const total = detalle.reduce((a, d) => a + d.valor, 0);

  return (
    <div className="screen result">
      <div className="result-hero card">
        <span className="result-trophy">🏆</span>
        <h2>VICTORIA — {ganador.nombre}</h2>
        <p className="result-sub">{char?.nombre} · {MOTIVOS[state.winner.motivo] ?? 'Victoria'}</p>
        <p className="result-points">{total} puntos</p>
        <div className="result-actions">
          <button className="btn btn-primary" onClick={() => goTo('newgame')}>▶ Nueva partida</button>
          <button className="btn btn-ghost" onClick={reset}>← Menú principal</button>
        </div>
      </div>

      <div className="content result-grid">
        <div className="card">
          <h3>Puntuación de {ganador.nombre}</h3>
          <table className="ranking">
            <tbody>
              {detalle.map((d) => (
                <tr key={d.etiqueta}>
                  <td>{d.etiqueta}</td>
                  <td className={d.valor < 0 ? 'neg' : ''}>{d.valor > 0 ? `+${d.valor}` : d.valor}</td>
                </tr>
              ))}
              <tr className="row-winner">
                <td><strong>TOTAL</strong></td>
                <td><strong>{total}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>¿Cómo ganaste?</h3>
          <ul className="log-list">
            {ganador.stats.ganadoElecciones > 0 && <li>🗳️ Ganaste {ganador.stats.ganadoElecciones} elección(es) presidencial(es).</li>}
            {ganador.stats.mandatosCompletados > 0 && <li>🏛️ Completaste {ganador.stats.mandatosCompletados} mandato(s) presidencial(es).</li>}
            {ganador.stats.proyectosCompletados > 0 && <li>🚧 Iniciaste {ganador.stats.proyectosCompletados} proyecto(s) público(s).</li>}
            {ganador.stats.investigacionesSuperadas > 0 && <li>⚖️ Superaste {ganador.stats.investigacionesSuperadas} investigación(es).</li>}
            {ganador.stats.escandalosSufridos > 0 && <li>💥 Sobreviviste a {ganador.stats.escandalosSufridos} escándalo(s).</li>}
            {ganador.assets.length > 0 && <li>💼 Tu cartera de activos genera {ganador.assets.reduce((a, x) => a + x.ingresoTurno, 0)} S/ por turno.</li>}
            {ganador.objectivesCompleted.map((oid) => (
              <li key={oid}>🎯 Objetivo: {OBJECTIVE_MAP[oid]?.titulo}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Ranking final</h3>
          <table className="ranking">
            <thead>
              <tr><th>#</th><th>Jugador</th><th>Dinero</th><th>Popularidad</th><th>Puntos</th></tr>
            </thead>
            <tbody>
              {scores.map((s, i) => {
                const p = getPlayer(state, s.playerId);
                return (
                  <tr key={p.id} className={p.id === ganador.id ? 'row-winner' : ''}>
                    <td>{i + 1}</td>
                    <td>{p.nombre}</td>
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
