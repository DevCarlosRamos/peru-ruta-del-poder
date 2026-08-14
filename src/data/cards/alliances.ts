import { c, o } from './helpers';

/** Cartas de ALIANZA (pactos ficticios, guardables). */
export const ALLIANCE_CARDS = [
  c('al1', 'Pacto con movimiento regional', 'alianza', 'FICCION',
    'El sur apoya tu nombre.',
    'Un movimiento regional ficticio (Movimiento Regional Flor y Viento) se alinea contigo.',
    'Situación ficticia.',
    { apoyoPolitico: 6, influencia: 4 }, undefined,
    { guardable: true, impacto: 'medio' }),
  c('al2', 'Coalición parlamentaria', 'alianza', 'FICCION',
    'Bancadas que suman.',
    'Coalición ficticia de bancadas técnicas. Apoyo político en el hemiciclo.',
    'Situación ficticia.',
    { apoyoPolitico: 8, dinero: -4 }, { institucional: 1, judicial: 0 },
    { guardable: true, rareza: 'poco_comun', impacto: 'alto' }),
  c('al3', 'Movimiento Cívico Cercanía', 'alianza', 'FICCION',
    'Voluntarios, banderines y buena vibra.',
    'Movimiento cívico ficticio que te acompaña en campañas.',
    'Situación ficticia.',
    { apoyoPolitico: 4, popularidad: 4 }, undefined, { guardable: true }),
  c('al4', 'Un grupo político ofrece apoyo', 'alianza', 'FICCION',
    '10 de influencia a cambio de una bancada.',
    'Un grupo de interés ficticio ofrece su maquinaria: influencia a cambio de respaldo electoral.',
    'Situación ficticia.',
    {}, { institucional: 3, judicial: 0 },
    { guardable: true, rareza: 'poco_comun', impacto: 'medio', decision: { opciones: [
      o('Aceptar (10 influencia → +20 apoyo político, +5 riesgo)', undefined, 10, undefined, { influencia: -10 }, { apoyoPolitico: 20 }),
      o('Declinar', undefined, undefined, undefined, undefined),
    ] } }),
];
