import { BALANCE } from './constants';
import type { ContentTag, GameState, Investigation, InvestigationState } from './types';
import { applyDelta, getPlayer, log, uid } from './utils';
import { Rng } from './rng';

/**
 * Sistema de INVESTIGACIONES de "PERÚ: LA RUTA DEL PODER".
 * Estados: sin → rumor → preliminar → formal → resolución.
 * Los resultados son MECÁNICAS FICTICIAS de juego; no describen procesos
 * judiciales reales ni implican culpabilidad de ninguna persona.
 */

export const INVESTIGATION_ORDER: InvestigationState[] = [
  'sin_investigacion',
  'rumor',
  'investigacion_preliminar',
  'investigacion_formal',
  'resolucion',
];

export const INVESTIGATION_LABEL: Record<InvestigationState, string> = {
  sin_investigacion: 'Sin investigación',
  rumor: 'Rumor',
  investigacion_preliminar: 'Investigación preliminar',
  investigacion_formal: 'Investigación formal',
  resolucion: 'Resolución',
};

/** Abre una investigación si el jugador no tiene una activa. */
export function openInvestigation(
  state: GameState,
  playerId: string,
  origen: Investigation['origen'],
  titulo: string,
  tag: ContentTag,
  descripcion: string,
): Investigation | null {
  const p = getPlayer(state, playerId);
  const activa = p.investigations.some((i) => i.estado !== 'resolucion');
  if (activa) return null;
  const inv: Investigation = {
    id: uid('inv'),
    titulo,
    estado: 'rumor',
    origen,
    turnosDeEspera: 1,
    tag,
    descripcion,
  };
  p.investigations.push(inv);
  log(state, `${p.nombre}: se abre una investigación ("${titulo}").`, 'negativo', p.id);
  return inv;
}

/** Avanza la investigación activa al siguiente estado. */
export function advanceInvestigation(state: GameState, playerId: string): void {
  const p = getPlayer(state, playerId);
  const inv = p.investigations.find((i) => i.estado !== 'resolucion');
  if (!inv) return;
  const idx = INVESTIGATION_ORDER.indexOf(inv.estado);
  if (idx >= 0 && idx < INVESTIGATION_ORDER.length - 1) {
    inv.estado = INVESTIGATION_ORDER[idx + 1];
    if (inv.estado === 'investigacion_preliminar') {
      applyDelta(p, { popularidad: -4 });
      log(state, `${p.nombre}: la investigación "${inv.titulo}" pasa a preliminar.`, 'negativo', p.id);
    }
    if (inv.estado === 'investigacion_formal') {
      applyDelta(p, { popularidad: -6, influencia: -5 });
      log(state, `${p.nombre}: la investigación "${inv.titulo}" pasa a formal.`, 'crisis', p.id);
    }
    if (inv.estado === 'resolucion') {
      log(state, `${p.nombre}: la investigación "${inv.titulo}" llega a su resolución.`, 'info', p.id);
    }
  }
}

/**
 * Resuelve la investigación activa. `defendida` indica si el jugador gastó
 * recursos en defensa. Es una mecánica ficticia de azar + estadísticas.
 */
export function resolveInvestigation(state: GameState, playerId: string, rng: Rng, defendida: boolean): void {
  const p = getPlayer(state, playerId);
  const inv = p.investigations.find((i) => i.estado !== 'resolucion');
  if (!inv) return;

  const dado = rng.dice();
  const defensa = p.resources.poder + p.resources.influencia / 2 + (defendida ? 15 : 0);
  const presion = p.resources.riesgoJudicial / 2 + p.resources.riesgoInstitucional / 4;
  const score = dado * 5 + defensa - presion;

  inv.estado = 'resolucion';
  if (score >= 50) {
    applyDelta(p, { riesgoJudicial: -25, popularidad: 8, influencia: 5 });
    p.stats.investigacionesSuperadas += 1;
    log(state, `${p.nombre} supera la investigación "${inv.titulo}" (absolución de juego).`, 'positivo', p.id);
  } else {
    applyDelta(p, { dinero: -15, popularidad: -10, influencia: -8, poder: -10, riesgoJudicial: -10 });
    p.bloqueadoPresidencia = Math.max(p.bloqueadoPresidencia, 1);
    log(state, `${p.nombre} recibe una sanción de juego por la investigación "${inv.titulo}" (pierde recursos y popularidad).`, 'negativo', p.id);
  }
  inv.turnosDeEspera = 0;
}

/** Si el riesgo lo amerita, abre una investigación automáticamente (check de turno). */
export function tryOpenInvestigationByRisk(state: GameState, playerId: string, rng: Rng): void {
  const p = getPlayer(state, playerId);
  const tieneActiva = p.investigations.some((i) => i.estado !== 'resolucion');
  if (tieneActiva) return;
  const umbralJudicial = BALANCE.riesgoJudicialUmbralInvestigacion;
  const umbralInstitucional = BALANCE.riesgoInstitucionalUmbralInvestigacion;

  if (p.resources.riesgoJudicial >= umbralJudicial) {
    const pRiesgo =
      BALANCE.probabilidadInvestigacionBase +
      (p.resources.riesgoJudicial - umbralJudicial) * BALANCE.probabilidadInvestigacionExtra;
    if (rng.chance(pRiesgo)) {
      openInvestigation(
        state,
        p.id,
        'riesgo',
        'Diligencias por exposición judicial',
        'FICCION',
        'Mecánica abstracta: el nivel de riesgo judicial alcanzado atrae la atención de instituciones (ficticias) del juego.',
      );
    }
  }
  if (p.resources.riesgoInstitucional >= umbralInstitucional) {
    const pRiesgo =
      BALANCE.probabilidadInvestigacionBase +
      (p.resources.riesgoInstitucional - umbralInstitucional) * BALANCE.probabilidadInvestigacionExtra;
    if (rng.chance(pRiesgo)) {
      openInvestigation(
        state,
        p.id,
        'riesgo',
        'Comisión de investigación en el Congreso',
        'FICCION',
        'Mecánica abstracta: el clima institucional genera una comisión investigadora (ficticia) del juego.',
      );
    }
  }
}
