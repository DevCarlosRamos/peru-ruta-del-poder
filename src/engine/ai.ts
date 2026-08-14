import type { GameState, PendingDecision, Player, ResourceDelta } from './types';
import { AI_PROFILES } from '../data/aiProfiles';
import { Rng } from './rng';

/**
 * IA de "PERÚ: LA RUTA DEL PODER".
 * Cada jugador IA tiene un perfil de comportamiento que modula sus decisiones
 * según recursos, situación y tolerancia al riesgo.
 */

function perfil(p: Player) {
  return AI_PROFILES[p.aiProfile ?? 'oportunista'];
}

/** Utilidad numérica de un delta de recursos (cuánto le conviene a la IA). */
function utilidadDelta(p: Player, delta: ResourceDelta | undefined): number {
  if (!delta) return 0;
  const prof = perfil(p);
  const d = {
    dinero: delta.dinero ?? 0,
    popularidad: delta.popularidad ?? 0,
    influencia: delta.influencia ?? 0,
    poder: delta.poder ?? 0,
    apoyoPolitico: delta.apoyoPolitico ?? 0,
    riesgoInstitucional: delta.riesgoInstitucional ?? 0,
    riesgoJudicial: delta.riesgoJudicial ?? 0,
    deuda: delta.deuda ?? 0,
  };
  let u =
    d.dinero +
    d.popularidad * 1.6 +
    d.influencia * 1.4 +
    d.poder * 1.2 +
    d.apoyoPolitico * 1.3;
  u -= d.riesgoInstitucional * (0.6 + prof.tolerancia);
  u -= d.riesgoJudicial * (1 + prof.tolerancia * 1.5);
  u -= d.deuda * 1.5;
  return u;
}

/** La IA elige el índice de la opción de una decisión pendiente. */
export function aiChoose(state: GameState, p: Player, rng: Rng): number {
  const d = state.pendingDecision;
  if (!d) return 0;
  const prof = perfil(p);

  switch (d.tipo) {
    case 'carta':
    case 'carta_decision': {
      const scores = d.opciones.map((o, i) => {
        const base = utilidadDelta(p, o.efecto);
        // Penaliza decisiones que exigen recursos que no tiene.
        let mult = 1;
        if (o.requiereDinero && p.resources.dinero < o.requiereDinero) mult -= 0.8;
        if (o.requiereInfluencia && p.resources.influencia < o.requiereInfluencia) mult -= 0.8;
        // Ruido para decisiones cercanas.
        return { i, s: base * mult + rng.next() * 4 - 2 };
      });
      scores.sort((a, b) => b.s - a.s);
      return scores[0].i;
    }
    case 'tile':
    case 'accion': {
      return chooseByAction(state, p, rng, d);
    }
    case 'investigacion_resolucion': {
      const def = d.opciones.find((o) => o.accion === 'tribunal_defiende');
      const idx = d.opciones.findIndex((o) => o.accion === 'tribunal_defiende');
      if (def && p.resources.dinero >= (def.requiereDinero ?? 8)) return idx;
      return d.opciones.findIndex((o) => o.accion === 'tribunal_sin');
    }
    case 'vacancia': {
      const mitigar = d.opciones.find((o) => o.accion === 'vacancia_mitiga');
      const idx = d.opciones.findIndex((o) => o.accion === 'vacancia_mitiga');
      if (mitigar && p.resources.influencia >= (mitigar.requiereInfluencia ?? 20) && prof.diplomacia > 0.3) return idx;
      return d.opciones.findIndex((o) => o.accion === 'vacancia_enfrentar');
    }
    default: {
      // Por defecto, maximiza utilidad con ruido.
      const scores = d.opciones.map((o, i) => ({ i, s: utilidadDelta(p, o.efecto) + rng.next() * 4 }));
      scores.sort((a, b) => b.s - a.s);
      return scores[0].i;
    }
  }
}

/** Heurística de elección para decisiones de casilla y acciones de turno. */
function chooseByAction(_state: GameState, p: Player, rng: Rng, d: PendingDecision): number {
  const prof = perfil(p);
  const ops = d.opciones;
  const r = p.resources;
  const wantCampana = r.popularidad < 55 || prof.populismo > 0.6;
  const wantInvertir = r.dinero > 25 && prof.inversion > 0.5;
  const wantAlianza = r.influencia > 15 && (r.apoyoPolitico < 45 || prof.diplomacia > 0.6);
  const wantDefensa = r.riesgoJudicial > 45 && prof.tolerancia < 0.5;

  // Preferencias ordenadas por prioridad según perfil.
  const preferencias: string[] = [];
  if (wantDefensa) preferencias.push('defender', 'tribunal_defiende');
  if (wantAlianza) preferencias.push('alianza', 'congreso_cabildeo');
  if (wantInvertir) preferencias.push('comprar', 'proyecto');
  if (wantCampana) preferencias.push('campana', 'medios');
  if (prof.agresividad > 0.6 && r.riesgoInstitucional < 50 && r.riesgoJudicial < 40) {
    preferencias.push('gestion');
  }
  if (r.deuda > 25) preferencias.push('pagar_deuda');

  for (const pref of preferencias) {
    const idx = ops.findIndex((o) => o.accion?.startsWith(pref));
    if (idx >= 0) {
      const op = ops[idx];
      if (op.requiereDinero && r.dinero < op.requiereDinero) continue;
      if (op.requiereInfluencia && r.influencia < op.requiereInfluencia) continue;
      if (rng.chance(0.85)) return idx;
    }
  }
  // Fallback: la última opción suele ser "no hacer nada / terminar turno".
  const terminar = ops.findIndex((o) => o.accion === 'terminar_turno');
  return terminar >= 0 ? terminar : 0;
}

/** La IA elige una acción de turno (devuelve el id de acción). */
export function aiDecideAction(_state: GameState, p: Player, rng: Rng): string {
  const prof = perfil(p);
  const r = p.resources;

  if (r.riesgoJudicial > 45 && prof.tolerancia < 0.5 && r.dinero >= 8) return 'defender';
  if (r.deuda > 25 && r.dinero > 10) return 'pagar_deuda';
  if (prof.agresividad > 0.65 && r.riesgoInstitucional < 50 && r.riesgoJudicial < 40) return 'gestion';
  if ((r.popularidad < 55 || prof.populismo > 0.6) && r.dinero >= 10) return 'campana';
  if (r.influencia > 15 && (r.apoyoPolitico < 45 || prof.diplomacia > 0.6)) return 'alianza';
  if (r.dinero > 25 && prof.inversion > 0.5 && rng.chance(0.7)) {
    return rng.chance(0.5) ? 'proyecto' : 'comprar';
  }
  return 'terminar';
}
