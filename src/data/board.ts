import type { TileDef, TileKind } from '../engine/types';

/**
 * Tablero ORIGINAL de "PERÚ: LA RUTA DEL PODER".
 * El "Camino del Poder" es un recorrido de 28 casillas (7 columnas × 4 filas,
 * en serpentina) con identidad visual peruana contemporánea y satírica.
 * Cada casilla declara sus cartas asociadas, recompensas y riesgos para poder
 * ser inspeccionada antes de caer en ella.
 */

function tile(
  id: number,
  kind: TileKind,
  nombre: string,
  subtitulo: string,
  icono: string,
  color: string,
  efecto: string,
  extra: { cartas?: import('../engine/types').CardCategory[]; recompensas?: string[]; riesgos?: string[]; decisiones?: string[] } = {},
): TileDef {
  return { id, kind, nombre, subtitulo, descripcion: efecto, icono, color, ...extra };
}

export const BOARD: TileDef[] = [
  tile(0, 'salida', 'Plaza Central', 'Inicio del circuito', '🗼', '#1f6f8b',
    'Punto de partida. Al pasar o caer cobras S/ 10 de canon ciudadano.',
    { recompensas: ['+10 S/ al pasar o caer'], riesgos: [], decisiones: [] }),
  tile(1, 'campana', 'Campaña', 'Mitin de barrio', '📣', '#e67e22',
    'Robas una carta de Campaña: decide cuánto invertir en tu presencia electoral.',
    { cartas: ['campana'], recompensas: ['+popularidad', '+influencia'], riesgos: ['Gasto de campaña'], decisiones: ['Invertir o pasar', 'Estrategia agresiva o segura'] }),
  tile(2, 'congreso', 'Congreso', 'Cabildeo legislativo', '🏛️', '#7f8c8d',
    'Robas una carta de Congreso: negocia con bancadas ficticias.',
    { cartas: ['congreso'], recompensas: ['+apoyo político', '+poder'], riesgos: ['-influencia', 'Riesgo institucional'], decisiones: ['Ceder cargos', 'Presionar con poder'] }),
  tile(3, 'region', 'Región', 'Visita a provincias', '🗺️', '#27ae60',
    'Evento regional: ganas el cariño local.',
    { recompensas: ['+5 popularidad', '+2 influencia si popularidad < 50'], riesgos: [], decisiones: [] }),
  tile(4, 'proyecto', 'Proyecto', 'Obra pública', '🚧', '#f39c12',
    'Robas una carta de Proyecto: aprueba una obra ficticia o guárdala.',
    { cartas: ['proyecto'], recompensas: ['+popularidad', '+poder', '+dinero al completar'], riesgos: ['Sobrecostos', 'Proyecto fallido'], decisiones: ['Aprobar', 'Rechazar', 'Guardar'] }),
  tile(5, 'inversion', 'Inversión', 'Ronda de capitales', '💼', '#2980b9',
    'Robas una carta de Inversión: arriesga capital con probabilidad real.',
    { cartas: ['inversion'], recompensas: ['+S/ 100 a +700', '+influencia'], riesgos: ['-S/ 50 a -250', '+riesgo institucional'], decisiones: ['Invertir en niveles', 'Rechazar', 'Guardar'] }),
  tile(6, 'crisis', 'Crisis', 'Tormenta institucional', '🌩️', '#c0392b',
    'Robas una carta de Crisis: elige cómo reaccionar ante la emergencia.',
    { cartas: ['crisis'], recompensas: ['+S/ si resuelves bien'], riesgos: ['-popularidad', '-S/', '+riesgo institucional'], decisiones: ['Invertir en el rescate', 'No intervenir', 'Pedir préstamo'] }),
  tile(7, 'evento_nacional', 'Evento Nacional', 'Agenda del país', '📰', '#8e44ad',
    'Robas una carta de Evento Nacional.',
    { cartas: ['evento_nacional'], recompensas: ['+poder', '+popularidad'], riesgos: ['Riesgo institucional', '-apoyo político'], decisiones: ['Según la carta'] }),
  tile(8, 'medios', 'Medios', 'Portada de diario', '📺', '#2c3e50',
    'La prensa habla de ti: aparece gratis o paga por el doble de exposición.',
    { recompensas: ['+4 influencia, +3 popularidad', '+8 influencia, +6 popularidad (S/ 8)'], riesgos: ['Gasto S/ 8'], decisiones: ['Aparecer', 'Campaña mediática pagada'] }),
  tile(9, 'oposicion', 'Oposición', 'Moción en el hemiciclo', '🗣️', '#95a5a6',
    'Robas una carta de Oposición: la bancada opositora arremete.',
    { cartas: ['oposicion'], recompensas: ['Mitigación con influencia'], riesgos: ['-apoyo político', '-poder'], decisiones: ['Mitigar', 'Aguantar el golpe'] }),
  tile(10, 'elecciones', 'Elecciones', 'Jornada electoral', '🗳️', '#c0392b',
    '¡Elecciones nacionales! Se convoca a todos los jugadores.',
    { recompensas: ['La presidencia', '+poder'], riesgos: ['Campaña costosa', 'Perder la contienda'], decisiones: ['Invertir en campaña', 'No gastar'] }),
  tile(11, 'investigacion', 'Investigación', 'Fiscalía de ficción', '🔎', '#7d3c98',
    'Las instituciones (ficticias) te observan: avanza o abre una investigación según tu riesgo judicial.',
    { recompensas: ['Limpieza de expediente si no hay nada'], riesgos: ['+riesgo judicial', 'Investigación'], decisiones: ['Afrontar la fiscalía'] }),
  tile(12, 'economia', 'Economía', 'Coyuntura', '💹', '#16a085',
    'Robas una carta de Economía: el mercado se mueve.',
    { cartas: ['economia'], recompensas: ['+S/ 6 a +10'], riesgos: ['-S/', 'Inflación'], decisiones: ['Según la carta'] }),
  tile(13, 'alianza', 'Alianza', 'Pacto de salón', '🤝', '#e74c3c',
    'Robas una carta de Alianza: un grupo ficticio ofrece su apoyo.',
    { cartas: ['alianza'], recompensas: ['+apoyo político', '+votos'], riesgos: ['-influencia', '+riesgo'], decisiones: ['Aceptar', 'Declinar', 'Guardar'] }),

  tile(14, 'riesgo', 'Riesgo', 'Zona gris', '⚠️', '#d35400',
    'Robas una carta de Oportunidad de alto riesgo: beneficio rápido a cambio de exposición.',
    { cartas: ['oportunidad'], recompensas: ['+S/ 50 a +700'], riesgos: ['+riesgo institucional/judicial', '-S/'], decisiones: ['Invertir en niveles', 'Rechazar'] }),
  tile(15, 'evento_internacional', 'Evento Internacional', 'Titular del exterior', '🌎', '#2e86c1',
    'Robas una carta de Evento Internacional.',
    { cartas: ['evento_internacional'], recompensas: ['+influencia', '+S/'], riesgos: ['-S/ por recesión externa'], decisiones: ['Aprovechar la tribuna', 'Buscar socios'] }),
  tile(16, 'proyecto', 'Proyecto', 'Megaobra regional', '🌉', '#f39c12',
    'Robas una carta de Proyecto: una obra de mayor envergadura.',
    { cartas: ['proyecto'], recompensas: ['+popularidad', '+poder'], riesgos: ['Sobrecostos'], decisiones: ['Aprobar', 'Rechazar', 'Guardar'] }),
  tile(17, 'escandalo', 'Escándalo', 'Portada bomba', '💥', '#922b21',
    'Robas una carta de Escándalo: sube tu nivel de riesgo.',
    { cartas: ['escandalo'], recompensas: ['Control de daños posible'], riesgos: ['-popularidad', '+riesgo institucional/judicial'], decisiones: ['Control de daños', 'No comentar'] }),
  tile(18, 'inversion', 'Inversión', 'Socio estratégico', '🧭', '#2980b9',
    'Robas una carta de Inversión a precio preferente.',
    { cartas: ['inversion'], recompensas: ['+S/ 100 a +700'], riesgos: ['-S/', '+riesgo'], decisiones: ['Invertir', 'Rechazar', 'Guardar'] }),
  tile(19, 'tribunal', 'Tribunal', 'Sala de audiencias', '⚖️', '#6c3483',
    'Se resuelve el frente judicial: defiéndete o paga para reducir riesgo.',
    { recompensas: ['Absolución de juego', '-riesgo judicial'], riesgos: ['Sanción de juego', '-popularidad'], decisiones: ['Contratar defensa', 'Defenderte sin recursos'] }),
  tile(20, 'oportunidad', 'Oportunidad', 'Ventana política', '🚪', '#f1c40f',
    'Robas una carta de Oportunidad: decide cuánto arriesgar o guárdala.',
    { cartas: ['oportunidad'], recompensas: ['+S/', '+popularidad'], riesgos: ['+riesgo', '-S/'], decisiones: ['Invertir', 'Guardar', 'Rechazar'] }),
  tile(21, 'region', 'Región', 'Festival andino', '🥁', '#229954',
    'Evento regional: +6 popularidad si tu popularidad es menor a 60.',
    { recompensas: ['+6 popularidad'], riesgos: [], decisiones: [] }),
  tile(22, 'campana', 'Campaña', 'Caravana', '🎪', '#e67e22',
    'Robas una carta de Campaña.',
    { cartas: ['campana'], recompensas: ['+popularidad'], riesgos: ['Gasto'], decisiones: ['Invertir', 'Pasar'] }),
  tile(23, 'congreso', 'Congreso', 'Comisión parlamentaria', '📋', '#7f8c8d',
    'Robas una carta de Congreso.',
    { cartas: ['congreso'], recompensas: ['+apoyo político'], riesgos: ['-influencia'], decisiones: ['Negociar', 'Pasar'] }),
  tile(24, 'economia', 'Economía', 'Coyuntura de mercado', '📊', '#16a085',
    'Robas una carta de Economía.',
    { cartas: ['economia'], recompensas: ['+S/'], riesgos: ['-S/'], decisiones: ['Según la carta'] }),
  tile(25, 'crisis', 'Crisis', 'Paro nacional', '🚛', '#b03a2e',
    'Robas una carta de Crisis: -6 popularidad o gastas S/ 12 para mitigarla.',
    { cartas: ['crisis'], recompensas: ['Mitigación posible'], riesgos: ['-popularidad', '-S/'], decisiones: ['Pagar para mitigar', 'Aguantar'] }),
  tile(26, 'elecciones', 'Elecciones', 'Segunda vuelta', '🏁', '#c0392b',
    '¡Nueva jornada electoral!',
    { recompensas: ['La presidencia'], riesgos: ['Campaña costosa'], decisiones: ['Invertir en campaña'] }),
  tile(27, 'palacio', 'Palacio de Gobierno', 'Casa de Gobierno', '🏦', '#212f3d',
    'Meta de la etapa de gobierno: el presidente reside aquí durante su mandato. Los demás ganan poder al visitarlo.',
    { recompensas: ['+5 poder, +3 influencia (visitantes)', 'Presupuesto de gobierno (presidente)'], riesgos: ['Gasto de palacio', 'Vacancia si el riesgo es extremo'], decisiones: ['Decisiones presidenciales durante el mandato'] }),
];

export const BOARD_SIZE = BOARD.length;

/** Posición inicial de todos los jugadores. */
export const START_POSITION = 0;

