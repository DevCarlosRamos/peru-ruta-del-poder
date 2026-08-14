import { c, o } from './helpers';

/** Cartas de INVERSIÓN (decisiones de capital con probabilidad real). */
export const INVESTMENT_CARDS = [
  c('inv1', 'Proyecto de infraestructura', 'inversion', 'FICCION',
    'Puedes invertir capital en un proyecto de obra.',
    'Un consorcio ficticio ofrece participar en una obra pública. Invierte S/ 100 con un 70% de éxito.',
    'Situación ficticia con empresas ficticias.',
    {}, { institucional: 2, judicial: 0 },
    { guardable: true, rareza: 'poco_comun', impacto: 'alto', decision: { opciones: [
      o('Invertir S/ 100 (70% de éxito → +S/300)', 100, undefined, 0.7, { dinero: -100 }, { dinero: 300, popularidad: 3 }, { dinero: -100, riesgoInstitucional: 5 }),
      o('Rechazar', undefined, undefined, undefined, undefined),
    ] } }),
  c('inv2', 'Cartera agresiva', 'inversion', 'FICCION',
    'Mercados, apuestas y nervios.',
    'Un fondo ficticio ofrece una cartera de alto riesgo: elige cuánto apostar.',
    'Situación ficticia.',
    {}, { institucional: 3, judicial: 0 },
    { rareza: 'poco_comun', impacto: 'alto', guardable: true, decision: { opciones: [
      o('Apostar S/ 50 (+S/100, riesgo 15%)', 50, undefined, 0.85, { dinero: -50 }, { dinero: 100 }, { dinero: -50 }),
      o('Apostar S/ 100 (+S/250, riesgo 30%)', 100, undefined, 0.7, { dinero: -100 }, { dinero: 250 }, { dinero: -100 }),
      o('Apostar S/ 250 (+S/700, riesgo 50%)', 250, undefined, 0.5, { dinero: -250 }, { dinero: 700 }, { dinero: -250, riesgoJudicial: 3 }),
    ] } }),
  c('inv3', 'Concesión del puerto ficticio', 'inversion', 'FICCION',
    'El puerto de Ventura busca socio.',
    'Concesión ficticia a largo plazo: costo alto, retorno seguro pero lento.',
    'Situación ficticia.',
    { dinero: -40 }, { institucional: 1, judicial: 0 },
    { rareza: 'raro', impacto: 'alto', guardable: true, decision: { opciones: [
      o('Entrar con S/ 40 (+S/80 en 2 turnos, sin riesgo)', 40, undefined, undefined, { dinero: -40 }, { dinero: 80, poder: 3 }),
      o('Pasar', undefined, undefined, undefined, undefined),
    ] } }),
];
