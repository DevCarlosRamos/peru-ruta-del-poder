import { useEffect, useRef, useState } from 'react';
import type { GameState } from '../../engine/types';
import { getPlayer } from '../../engine/utils';
import { CARD_MAP, CATEGORY_STYLE } from '../../data/cards';
import { playSound } from '../sound';

type Fase = 'carta' | 'resolviendo' | 'resultado' | 'cerrado';

interface Props {
  state: GameState;
  onChoose: (index: number) => void;
}

/** Barra de probabilidad: ██████░░░░ 30% */
function ProbBar({ prob }: { prob: number }) {
  const pct = Math.round(prob * 100);
  return (
    <div className="prob" title={`Probabilidad de éxito: ${pct}%`}>
      <div className="prob-track">
        <div className="prob-fill" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      <span className="prob-value">{pct}%</span>
    </div>
  );
}

/**
 * Modal de carta con animación de mesa:
 * entrada → volteo → decisión → resolución → resultado → cierre.
 * La lógica probabilística vive en el motor (applyCardChoice); la UI solo anima.
 */
export function CardModal({ state, onChoose }: Props) {
  const d = state.pendingDecision;
  const card = d?.cardId ? CARD_MAP[d.cardId] : null;
  const p = d ? getPlayer(state, d.jugadorId) : null;

  const [fase, setFase] = useState<Fase>('carta');
  const [flipped, setFlipped] = useState(false);
  const [logBefore, setLogBefore] = useState(0);
  const [mensajes, setMensajes] = useState<string[]>([]);
  const [cartaActual, setCartaActual] = useState<string | null>(null);
  const [resultadoFase, setResultadoFase] = useState<'exito' | 'fallo' | null>(null);
  const audioPlayed = useRef(false);

  // Nueva carta → animación de entrada y volteo.
  useEffect(() => {
    if (d?.cardId && cartaActual !== d.cardId) {
      setCartaActual(d.cardId);
      setFase('carta');
      setFlipped(false);
      setMensajes([]);
      setResultadoFase(null);
      audioPlayed.current = false;
      playSound('carta');
      const t = setTimeout(() => setFlipped(true), 350);
      return () => clearTimeout(t);
    }
  }, [d?.cardId, cartaActual]);

  // Al resolverse (desaparece pendingDecision) → mostrar resultado con mensajes del log.
  useEffect(() => {
    if (!state.pendingDecision && fase === 'resolviendo') {
      const nuevos = state.log.slice(logBefore);
      setMensajes(nuevos.map((l) => l.mensaje));
      const hayExito = nuevos.some((l) => l.mensaje.includes('éxito') || l.mensaje.includes('exitosa'));
      const hayFallo = nuevos.some((l) => l.mensaje.includes('adverso') || l.mensaje.includes('falla'));
      setResultadoFase(hayExito && !hayFallo ? 'exito' : hayFallo && !hayExito ? 'fallo' : null);
      if (!audioPlayed.current) {
        if (hayExito && !hayFallo) playSound('exito');
        else if (hayFallo && !hayExito) playSound('fallo');
        audioPlayed.current = true;
      }
      setFase('resultado');
    }
  }, [state.pendingDecision, state.log.length, fase, logBefore]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!d || !card || !p) return null;
  if (d.tipo !== 'carta' && d.tipo !== 'carta_decision') return null;
  if (fase === 'cerrado') return null;

  const estilo = CATEGORY_STYLE[card.categoria];

  const elegir = (i: number) => {
    setLogBefore(state.log.length);
    setFase('resolviendo');
    playSound('dado');
    setTimeout(() => onChoose(i), 1100);
  };

  return (
    <div className="modal-overlay">
      <div className="card-modal-wrap" role="dialog" aria-modal="true" aria-label={card.nombre}>
        <div className={`card-physical ${flipped ? 'flipped' : ''} ${fase === 'resultado' ? 'resuelta' : ''}`}>
          <div className="card-front">
            <div className="card-front-head" style={{ background: `linear-gradient(135deg, ${estilo.color}, #141a22)` }}>
              <span className="badge">{estilo.etiqueta}</span>
              <span className="badge badge-rare">{card.rareza}</span>
            </div>
            <div className="card-front-body">
              <span className="card-cat-icon">{estilo.icono}</span>
              <h3 className="card-titulo">{card.nombre}</h3>
              <p className="card-tag">{card.tag}</p>
              <p className="card-desc">{card.textoCorto}</p>
            </div>
          </div>
          <div className="card-back">
            <span>🗳️</span>
            <strong>PERÚ</strong>
            <small>LA RUTA DEL PODER</small>
          </div>
        </div>

        {fase === 'carta' && (
          <div className="card-panel">
            <h4>{card.nombre}</h4>
            <p className="card-descripcion">{card.descripcion}</p>
            <p className="hint">Contexto: {card.contexto}</p>
            {card.requiereVerificacion && <p className="badge badge-warn">⚠ {card.requiereVerificacion}</p>}
            <div className="card-options">
              {d.opciones.map((op, i) => {
                const sinDinero = op.requiereDinero != null && p.resources.dinero < op.requiereDinero;
                const sinInfluencia = op.requiereInfluencia != null && p.resources.influencia < op.requiereInfluencia;
                const bloqueada = sinDinero || sinInfluencia;
                return (
                  <button key={i} className={`btn btn-option ${bloqueada ? 'btn-disabled' : ''}`} disabled={bloqueada} onClick={() => elegir(i)}>
                    <span className="option-main">{op.texto}</span>
                    {op.probabilidad !== undefined && <ProbBar prob={op.probabilidad} />}
                    {(op.requiereDinero != null || op.requiereInfluencia != null) && (
                      <span className="option-costos">
                        {op.requiereDinero != null && <span>💰 {op.requiereDinero}</span>}
                        {op.requiereInfluencia != null && <span>🏛️ {op.requiereInfluencia}</span>}
                      </span>
                    )}
                    {sinDinero && <em className="btn-note">(sin dinero)</em>}
                    {sinInfluencia && <em className="btn-note">(sin influencia)</em>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {fase === 'resolviendo' && (
          <div className="card-panel resolving">
            <div className="spinner" />
            <p>Resolviendo…</p>
            <p className="hint">El resultado se calcula ahora (riesgo vs recompensa).</p>
          </div>
        )}

        {fase === 'resultado' && (
          <div className={`card-panel resultado ${resultadoFase === 'exito' ? 'r-exito' : ''} ${resultadoFase === 'fallo' ? 'r-fallo' : ''}`}>
            <h4>{resultadoFase === 'exito' ? '✅ ¡Éxito!' : resultadoFase === 'fallo' ? '❌ Resultado adverso' : 'Resuelto'}</h4>
            <ul className="resultado-lista">
              {mensajes.slice(-6).map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
            <button className="btn btn-primary btn-big" onClick={() => setFase('cerrado')}>
              Continuar →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
