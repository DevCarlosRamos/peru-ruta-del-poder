import { c } from './helpers';

/** Cartas de ELECCIÓN (clima electoral). */
export const ELECTION_CARDS = [
  c('el1', 'Debate electoral encendido', 'eleccion', 'FICCION',
    'El rating sube, las propuestas también.',
    'Debate ficticio: ganas popularidad e influencia para la contienda.',
    'Situación ficticia.',
    { popularidad: 6, influencia: 4 }, undefined, { rareza: 'poco_comun', impacto: 'medio' }),
  c('el2', 'Encuesta de última hora', 'eleccion', 'FICCION',
    'Las encuestas pintan de colores.',
    'Encuesta ficticia favorable: bono de popularidad en campaña.',
    'Situación ficticia.',
    { popularidad: 8 }, undefined, { impacto: 'medio' }),
  c('el3', 'Denuncias sin pruebas en campaña', 'eleccion', 'SATIRA',
    'En campaña todo se dice.',
    'Sátira: una denuncia sin pruebas (y sin nombre real) llena portadas. Sube el riesgo de todos los candidatos.',
    'Situación satírica ficticia.',
    { riesgoInstitucional: 5 }, { institucional: 5, judicial: 0 }),
];
