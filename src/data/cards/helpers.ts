import type { CardCategory, CardDef, ContentTag, Rarity, ResourceDelta } from '../../engine/types';

/**
 * Helper para definir cartas de forma compacta.
 * `opts` admite: rareza, impacto, decision (opciones ricas), probabilidad,
 * guardable, fuente, condiciones, requiereVerificacion.
 */
export function c(
  id: string,
  nombre: string,
  categoria: CardCategory,
  tag: ContentTag,
  textoCorto: string,
  descripcion: string,
  contexto: string,
  efectos: ResourceDelta,
  riesgo: { institucional: number; judicial: number } = { institucional: 0, judicial: 0 },
  opts: {
    rareza?: Rarity;
    impacto?: 'bajo' | 'medio' | 'alto';
    decision?: { opciones: import('../../engine/types').CardDecisionOption[] };
    probabilidad?: number;
    guardable?: boolean;
    fuente?: string;
    condiciones?: string;
    requiereVerificacion?: string;
  } = {},
): CardDef {
  const dinero = efectos.dinero ?? 0;
  return {
    id,
    nombre,
    categoria,
    tag,
    descripcion,
    contexto,
    efectos,
    costo: dinero < 0 ? -dinero : 0,
    recompensa: dinero > 0 ? dinero : 0,
    riesgo,
    rareza: opts.rareza ?? 'comun',
    impacto: opts.impacto ?? 'bajo',
    textoCorto,
    decision: opts.decision,
    probabilidad: opts.probabilidad,
    guardable: opts.guardable,
    fuente: opts.fuente,
    condiciones: opts.condiciones,
    requiereVerificacion: opts.requiereVerificacion,
  };
}

/** Opción de decisión compacta (riesgo/recompensa). */
export function o(
  texto: string,
  costoDinero?: number,
  costoInfluencia?: number,
  probabilidad?: number,
  efectosFijos?: ResourceDelta,
  efectosExito?: ResourceDelta,
  efectosFallo?: ResourceDelta,
): import('../../engine/types').CardDecisionOption {
  return { texto, costoDinero, costoInfluencia, probabilidad, efectosFijos, efectosExito, efectosFallo };
}
