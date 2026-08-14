import type { AIProfile } from '../engine/types';

/** Perfiles de IA de "PERÚ: LA RUTA DEL PODER". */
export const AI_PROFILES: Record<string, AIProfile> = {
  agresivo: {
    nombre: 'agresivo',
    agresividad: 0.9,
    inversion: 0.4,
    populismo: 0.3,
    diplomacia: 0.2,
    tolerancia: 0.8,
  },
  conservador: {
    nombre: 'conservador',
    agresividad: 0.1,
    inversion: 0.6,
    populismo: 0.3,
    diplomacia: 0.4,
    tolerancia: 0.2,
  },
  oportunista: {
    nombre: 'oportunista',
    agresividad: 0.6,
    inversion: 0.5,
    populismo: 0.5,
    diplomacia: 0.3,
    tolerancia: 0.5,
  },
  economico: {
    nombre: 'economico',
    agresividad: 0.3,
    inversion: 0.9,
    populismo: 0.2,
    diplomacia: 0.3,
    tolerancia: 0.4,
  },
  populista: {
    nombre: 'populista',
    agresividad: 0.4,
    inversion: 0.2,
    populismo: 0.9,
    diplomacia: 0.3,
    tolerancia: 0.5,
  },
  negociador: {
    nombre: 'negociador',
    agresividad: 0.3,
    inversion: 0.5,
    populismo: 0.3,
    diplomacia: 0.9,
    tolerancia: 0.4,
  },
  arriesgado: {
    nombre: 'arriesgado',
    agresividad: 1,
    inversion: 0.3,
    populismo: 0.4,
    diplomacia: 0.2,
    tolerancia: 1,
  },
};

export const AI_PROFILE_NAMES = Object.keys(AI_PROFILES);
