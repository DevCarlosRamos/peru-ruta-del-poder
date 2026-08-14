import { c } from './helpers';

/** Cartas de OPOSICIÓN (ofensivas del bloque opositor, ficticias). */
export const OPPOSITION_CARDS = [
  c('op1', 'Bancada pide interpelación', 'oposicion', 'FICCION',
    'Preguntas incómodas en el pleno.',
    'Una bancada ficticia interpela a un ministro ficticio. Si tu apoyo político es bajo, pierdes poder.',
    'Situación ficticia.',
    { apoyoPolitico: -5, poder: -4 }, { institucional: 3, judicial: 0 }, { impacto: 'medio' }),
  c('op2', 'Censura al ministro de turno', 'oposicion', 'FICCION',
    'El gabinete pierde una pieza.',
    'Censura a un ministro ficticio por el pleno. Pierdes apoyo político.',
    'Situación ficticia.',
    { apoyoPolitico: -6 }, { institucional: 2, judicial: 0 }),
  c('op3', 'Mociones que no llegan a votación', 'oposicion', 'SATIRA',
    'Mucho ruido, pocas firmas.',
    'Sátira: decenas de mociones se presentan y ninguna se debate.',
    'Situación satírica ficticia.',
    { riesgoInstitucional: 3 }, { institucional: 3, judicial: 0 }),
];
