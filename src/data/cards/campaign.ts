import { c, o } from './helpers';

/** Cartas de CAMPAÑA (inversión electoral). */
export const CAMPAIGN_CARDS = [
  c('cam1', 'Campaña nacional', 'campana', 'FICCION',
    'Puedes aumentar tu presencia electoral.',
    'Compra espacios ficticios en medios y mitines: costo alto, retorno en popularidad.',
    'Situación ficticia.',
    { popularidad: 8, dinero: -10 }, undefined,
    { guardable: true, impacto: 'medio', decision: { opciones: [
      o('Invertir S/ 150 (+15 popularidad, riesgo 0%)', 150, undefined, 1, { dinero: -150 }, { popularidad: 15, influencia: 3 }),
      o('No invertir', undefined, undefined, undefined, undefined),
    ] } }),
  c('cam2', 'Caravana regional', 'campana', 'FICCION',
    'Pueblo a pueblo, foto a foto.',
    'Una caravana ficticia por provincias sube tu popularidad en regiones.',
    'Situación ficticia.',
    { popularidad: 6, dinero: -6 }, undefined, { guardable: true }),
  c('cam3', 'Debate de candidatos', 'campana', 'FICCION',
    'El público decide en las urnas de la tele.',
    'Un debate ficticio: arriesga imagen por notoriedad.',
    'Situación ficticia.',
    {}, undefined,
    { guardable: true, rareza: 'poco_comun', impacto: 'alto', decision: { opciones: [
      o('Estrategia agresiva (60% → +12 popularidad, 40% → -8)', undefined, undefined, 0.6, undefined, { popularidad: 12 }, { popularidad: -8 }),
      o('Estrategia segura (+4 popularidad)', undefined, undefined, undefined, undefined, { popularidad: 4 }),
    ] } }),
];
