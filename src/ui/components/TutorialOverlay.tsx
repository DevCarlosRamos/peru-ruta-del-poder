import { useEffect, useState } from 'react';

const PASOS: { titulo: string; texto: string }[] = [
  {
    titulo: 'Tu dinero',
    texto: 'Cada turno recibes ingresos: base + tus activos. Si eres presidente, además cobras el presupuesto de gobierno. El dinero financia campañas, proyectos y defensas.',
  },
  {
    titulo: 'Movimiento',
    texto: 'Lanzas 1d6 y avanzas por el "Camino del Poder". Al pasar por la Plaza Central cobras S/ 10. El presidente, en lugar de mover, resuelve una Decisión presidencial.',
  },
  {
    titulo: 'Casillas',
    texto: 'Las casillas (Campaña, Congreso, Región, Proyecto, Inversión, Medios, Alianza…) te ofrecen decisiones: invertir recursos para crecer o pasar de largo.',
  },
  {
    titulo: 'Eventos y cartas',
    texto: 'Las cartas de Crisis, Escándalo, Oportunidad, Economía, etc. están etiquetadas [HISTÓRICO], [INVESTIGACIÓN], [FICCIÓN] o [SÁTIRA]. Sus efectos son mecánicas de juego.',
  },
  {
    titulo: 'Influencia y apoyo',
    texto: 'La influencia permite cabildear y crear alianzas. El apoyo político es tu bancada en el Congreso: te protege de censuras y vacancias.',
  },
  {
    titulo: 'El riesgo',
    texto: 'Las "gestiones riesgosas" dan dinero rápido pero suben tu nivel de riesgo. Riesgo alto atrae investigaciones y escándalos: la estrategia es RIESGO → RECOMPENSA → CONSECUENCIA.',
  },
  {
    titulo: 'Elecciones',
    texto: 'Al caer en una casilla de Elecciones (o si no hay presidente) se convoca a votación. Tu popularidad, influencia, apoyo, poder, alianzas y un dado definen tus votos. El ganador gobierna 3 rondas.',
  },
  {
    titulo: 'Victoria',
    texto: 'Gana completando tu mandato con 45+ de popularidad, cumpliendo tus 2 Objetivos de Poder, o por mayor puntuación al final. ¡A la campaña!',
  },
];

/** Tutorial interactivo del primer turno (FASE 30). */
export function TutorialOverlay() {
  const [paso, setPaso] = useState(0);
  const [cerrado, setCerrado] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem('peru-tutorial-visto') === '1') setCerrado(true);
    } catch {
      // noop
    }
  }, []);
  if (cerrado) return null;
  const p = PASOS[paso];
  const cerrar = () => {
    try {
      localStorage.setItem('peru-tutorial-visto', '1');
    } catch {
      // noop
    }
    setCerrado(true);
  };
  return (
    <div className="modal-overlay">
      <div className="modal card" role="dialog" aria-modal="true" aria-label="Tutorial">
        <h3>🗺️ Tutorial — {p.titulo}</h3>
        <p className="modal-desc">{p.texto}</p>
        <div className="modal-options">
          <div className="tutorial-nav">
            <button
              className="btn btn-ghost"
              onClick={() => (paso > 0 ? setPaso(paso - 1) : cerrar())}
            >
              {paso > 0 ? '← Atrás' : 'Cerrar'}
            </button>
            <span className="hint">
              {paso + 1} / {PASOS.length}
            </span>
            <button className="btn btn-primary" onClick={() => (paso < PASOS.length - 1 ? setPaso(paso + 1) : cerrar())}>
              {paso < PASOS.length - 1 ? 'Siguiente →' : '¡A jugar! 🎲'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
