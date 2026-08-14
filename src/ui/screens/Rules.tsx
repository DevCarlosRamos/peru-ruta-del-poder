import { useState } from 'react';
import type { GameController } from '../../App';

const SECCIONES: { titulo: string; cuerpo: string }[] = [
  {
    titulo: 'Objetivo',
    cuerpo:
      'Llega a la presidencia y completa tu mandato con respaldo popular. También puedes ganar cumpliendo tus 2 "Objetivos de Poder", o sumando la mayor puntuación al final de la partida.',
  },
  {
    titulo: 'Recursos',
    cuerpo:
      'Dinero (S/ en millones), Popularidad (0-100), Influencia (0-100), Poder (0-100), Apoyo político (0-100), Riesgo institucional (0-100), Riesgo judicial (0-100) y Deuda. Todos son mecánicas de juego.',
  },
  {
    titulo: 'Estructura del turno',
    cuerpo:
      '1) Recibes ingresos y avanzan tus proyectos/alianzas. 2) Lanzas el dado y mueves. 3) Resuelves la casilla. 4) Realizas UNA acción opcional (campaña, inversión, proyecto, alianza, gestión riesgosa, defensa, pagar deuda). 5) Se comprueban riesgo, investigaciones, objetivos y victoria.',
  },
  {
    titulo: 'El tablero (28 casillas)',
    cuerpo:
      'El "Camino del Poder" cruza casillas como Campaña, Congreso, Elecciones, Región, Proyecto, Inversión, Crisis, Investigación, Escándalo, Tribunal, Medios, Alianza, Oposición, Economía, Mercado, Eventos, Oportunidad, Riesgo y el Palacio de Gobierno.',
  },
  {
    titulo: 'ETAPA A — Carrera política',
    cuerpo:
      'Acumula popularidad, influencia, apoyo político y poder para ganar las elecciones. Las elecciones se convocan al caer en una casilla de Elecciones o cuando no hay presidente.',
  },
  {
    titulo: 'ETAPA B — Gobierno',
    cuerpo:
      'El presidente deja de mover y, en cada turno, resuelve una "Decisión presidencial". Su mandato dura 3 rondas. Si su riesgo institucional se dispara, el Congreso puede intentar una vacancia. Al completar el mandato con 45+ de popularidad, ganas.',
  },
  {
    titulo: 'Riesgo → Recompensa → Consecuencia',
    cuerpo:
      'Las "gestiones riesgosas" dan dinero rápido pero suben tu nivel de riesgo. Riesgo alto atrae investigaciones (ficticias), escándalos, pérdida de aliados y posibles vacancias. Es una mecánica abstracta, no una afirmación sobre nadie.',
  },
  {
    titulo: 'Cartas',
    cuerpo:
      'El mazo mezcla cartas etiquetadas [HISTÓRICO], [INVESTIGACIÓN], [FICCIÓN] y [SÁTIRA]. Las referencias históricas son neutrales y verificables; el resto es ficción. Ninguna carta implica culpabilidad de una persona real.',
  },
  {
    titulo: 'Condiciones de victoria',
    cuerpo:
      'Ganas si: completas un mandato presidencial con respaldo popular; cumples todos tus Objetivos de Poder; o tienes la mayor puntuación al agotarse las rondas. Puntuación = dinero + influencia + popularidad + poder + activos + proyectos + objetivos − deudas − riesgos.',
  },
];

export function Rules({ game }: { game: GameController }) {
  const [abierta, setAbierta] = useState(0);
  return (
    <div className="screen">
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => game.goTo('home')}>
          ← Inicio
        </button>
        <h2 className="topbar-title">Reglas de la mesa</h2>
        <span className="topbar-spacer" />
      </header>
      <main className="content">
        <div className="accordion">
          {SECCIONES.map((s, i) => (
            <div className={`accordion-item ${abierta === i ? 'open' : ''}`} key={s.titulo}>
              <button
                className="accordion-head"
                onClick={() => setAbierta(abierta === i ? -1 : i)}
                aria-expanded={abierta === i}
              >
                <span>{i + 1}. {s.titulo}</span>
                <span className="accordion-icon">{abierta === i ? '−' : '+'}</span>
              </button>
              {abierta === i && <div className="accordion-body">{s.cuerpo}</div>}
            </div>
          ))}
        </div>
        <p className="hint">
          Esta es una obra satírica original. Las estadísticas y cartas son mecánicas de juego y
          no constituyen afirmaciones históricas, judiciales ni de culpabilidad sobre personas
          reales.
        </p>
      </main>
    </div>
  );
}
