import { useState } from 'react';

const SECCIONES: { titulo: string; cuerpo: string }[] = [
  { titulo: 'Cómo jugar', cuerpo: 'Inicia tu carrera, avanza por el tablero, gana las elecciones y gobierna. Cada turno: economía → dado → casilla → 1 acción → comprobaciones.' },
  { titulo: 'Recursos', cuerpo: 'Dinero, Popularidad, Influencia, Poder, Apoyo político, Riesgo institucional, Riesgo judicial y Deuda. Todos son mecánicas de juego.' },
  { titulo: 'Cartas', cuerpo: 'Las cartas generan decisiones con costo, recompensa y riesgo. Las probabilidades son reales y se resuelven al momento. Puedes guardar algunas cartas en tu mano.' },
  { titulo: 'Riesgo', cuerpo: '0-20 estable · 21-40 eventos de riesgo · 41-60 más investigaciones · 61-80 crisis frecuentes · 81-100 crítica. La estrategia es RIESGO → RECOMPENSA → CONSECUENCIA.' },
  { titulo: 'Elecciones', cuerpo: 'Se convocan al caer en la casilla de Elecciones o cuando no hay presidente. Campaña → primera vuelta → balotaje.' },
  { titulo: 'Investigaciones', cuerpo: 'Mecánicas ficticias: Rumor → Preliminar → Formal → Resolución. Nunca son procesos reales.' },
  { titulo: 'Victoria', cuerpo: 'Completa tu mandato con 45+ de popularidad, cumple tus 2 Objetivos de Poder, o gana por puntuación al final.' },
  { titulo: 'Derrota', cuerpo: 'No hay eliminación: puedes quebrar o ser vacado, pero siempre sigues en la partida.' },
];

/** Reglas en modal (no en la página). */
export function RulesModal({ onClose }: { onClose: () => void }) {
  const [abierta, setAbierta] = useState(0);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card modal-wide" role="dialog" aria-modal="true" aria-label="Reglas" onClick={(e) => e.stopPropagation()}>
        <h3>📖 Reglas de la mesa</h3>
        <div className="accordion">
          {SECCIONES.map((s, i) => (
            <div className={`accordion-item ${abierta === i ? 'open' : ''}`} key={s.titulo}>
              <button className="accordion-head" onClick={() => setAbierta(abierta === i ? -1 : i)} aria-expanded={abierta === i}>
                <span>{i + 1}. {s.titulo}</span>
                <span className="accordion-icon">{abierta === i ? '−' : '+'}</span>
              </button>
              {abierta === i && <div className="accordion-body">{s.cuerpo}</div>}
            </div>
          ))}
        </div>
        <div className="actions-center">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
