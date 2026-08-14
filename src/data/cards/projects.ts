import { c, o } from './helpers';

/** Cartas de PROYECTO (obras públicas ficticias, guardables). */
export const PROJECT_CARDS = [
  c('pr1', 'Proyecto ficticio "Agua para Todos"', 'proyecto', 'FICCION',
    'Una obra con nombre de campaña.',
    'Programa ficticio de acceso al agua en provincias. Ganas popularidad e influencia.',
    'Proyecto ficticio.',
    { dinero: -8, popularidad: 7, influencia: 3 }, { institucional: 1, judicial: 0 },
    { guardable: true, impacto: 'medio' }),
  c('pr2', 'Estadio del Bicentenario (ficticio)', 'proyecto', 'FICCION',
    'Inauguración con partido amistoso.',
    'Infraestructura deportiva ficticia. Popularidad inmediata, costo alto.',
    'Proyecto ficticio.',
    { dinero: -14, popularidad: 9 }, { institucional: 2, judicial: 0 },
    { guardable: true, rareza: 'poco_comun', impacto: 'medio' }),
  c('pr3', 'Teleférico del Cañón (fallido)', 'proyecto', 'FICCION',
    'El proyecto que no llegó a estrenarse.',
    'Proyecto ficticio fallido: obra paralizada. Solo pérdidas de imagen y dinero.',
    'Proyecto fallido ficticio.',
    { dinero: -6, popularidad: -5 }, { institucional: 4, judicial: 3 },
    { rareza: 'poco_comun', impacto: 'alto', requiereVerificacion: 'Proyecto 100% ficticio; no corresponde a ninguna obra real.' }),
  c('pr4', 'Proyecto público de alto impacto', 'proyecto', 'FICCION',
    'Una megaobra que definirá tu gestión.',
    'Obra pública ficticia de gran escala: inversión alta, popularidad alta y un 20% de riesgo de sobrecosto.',
    'Proyecto ficticio.',
    {}, { institucional: 2, judicial: 0 },
    { rareza: 'raro', impacto: 'alto', guardable: true, decision: { opciones: [
      o('Aprobar (S/ 300 → +25 popularidad, 80% de éxito)', 300, undefined, 0.8, { dinero: -300 }, { popularidad: 25, poder: 5 }, { dinero: -100, popularidad: -5 }),
      o('Rechazar', undefined, undefined, undefined, undefined),
    ] } }),
];
