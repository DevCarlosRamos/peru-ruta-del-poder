import { c, o } from './helpers';

/** Cartas de CONGRESO (negociación parlamentaria, ficticia). */
export const CONGRESS_CARDS = [
  c('cg1', 'Ley clave en el hemiciclo', 'congreso', 'FICCION',
    'Necesitas votos para tu reforma.',
    'Una reforma ficticia necesita mayoría. Negocia con bancadas ficticias.',
    'Situación ficticia.',
    {}, { institucional: 2, judicial: 0 },
    { rareza: 'poco_comun', impacto: 'alto', decision: { opciones: [
      o('Ceder un cargo (10 influencia → +15 apoyo, ley aprobada)', undefined, 10, undefined, { influencia: -10 }, { apoyoPolitico: 15, poder: 5 }),
      o('Presionar con tu poder (65% de éxito)', undefined, undefined, 0.65, undefined, { apoyoPolitico: 8, poder: 3 }, { poder: -5, apoyoPolitico: -3 }),
      o('Retirar el proyecto', undefined, undefined, undefined, { popularidad: -3 }),
    ] } }),
  c('cg2', 'Comisión investigadora', 'congreso', 'FICCION',
    'El hemiciclo quiere respuestas.',
    'Una comisión ficticia pide informes. Prepara tu defensa.',
    'Situación ficticia.',
    { riesgoInstitucional: 4, influencia: -2 }, { institucional: 4, judicial: 2 }, { impacto: 'medio' }),
  c('cg3', 'Presupuesto participativo', 'congreso', 'FICCION',
    'Repartir la torta.',
    'El pleno reparte un presupuesto ficticio. Tu influencia consigue una partida.',
    'Situación ficticia.',
    { dinero: 8, influencia: -3 }, undefined,
    { guardable: true, impacto: 'medio', decision: { opciones: [
      o('Reclamar partida (5 influencia → +S/12)', undefined, 5, undefined, { influencia: -5 }, { dinero: 12 }),
      o('Pasar', undefined, undefined, undefined, undefined),
    ] } }),
];
