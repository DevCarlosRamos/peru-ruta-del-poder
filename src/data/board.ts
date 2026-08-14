import type { TileDef, TileKind } from '../engine/types';

/**
 * Tablero ORIGINAL de "PERÚ: LA RUTA DEL PODER".
 *
 * Diseño propio: el "Camino del Poder" es un circuito de 28 casillas que cruza el
 * país ficticio representado como una sátira institucional. No copia ningún tablero
 * de juegos comerciales existentes.
 *
 * Reglas generales:
 * - Casilla 0 (Plaza Central): al pasar o caer se cobra "canon ciudadano" (+10 S/).
 * - Casillas de evento roban cartas del mazo según su tipo.
 * - Las casillas "Elecciones" disparan una elección nacional con todos los jugadores.
 * - La casilla 27 (Palacio de Gobierno) es la meta de la etapa de gobierno.
 */
export const BOARD: TileDef[] = [
  tile(0, 'salida', 'Plaza Central', 'Inicio del circuito', 'Icono: plaza con arco, estilo mapa cívico.', '🗼', '#1f6f8b', 'Punto de partida. Al pasar o caer cobras S/ 10 de canon ciudadano.'),
  tile(1, 'campana', 'Campaña', 'Mitin de barrio', 'Multitud estilizada.', '📣', '#e67e22', 'Ganas +4 de popularidad, o pagas S/ 10 para ganar +12.'),
  tile(2, 'congreso', 'Congreso', 'Cabildeo legislativo', 'Hemiciclo abstracto.', '🏛️', '#7f8c8d', 'Negocia con bancadas: gastas 5 de influencia para ganar +8 de apoyo político.'),
  tile(3, 'region', 'Región', 'Visita a provincias', 'Mapa regional con pin.', '🗺️', '#27ae60', 'Evento regional: ganas popularidad según tu gestión.'),
  tile(4, 'proyecto', 'Proyecto', 'Obra pública', 'Grúa y plano.', '🚧', '#f39c12', 'Se te ofrece iniciar un proyecto público (inversión).'),
  tile(5, 'inversion', 'Inversión', 'Ronda de capitales', 'Gráfico de crecimiento.', '💼', '#2980b9', 'Se te ofrece comprar un activo del mercado.'),
  tile(6, 'crisis', 'Crisis', 'Tormenta institucional', 'Nube de tormenta.', '🌩️', '#c0392b', 'Crisis nacional: sufres penalizaciones de popularidad o dinero.'),
  tile(7, 'evento_nacional', 'Evento Nacional', 'Agenda del país', 'Hilo de noticias.', '📰', '#8e44ad', 'Roba una carta de Evento Político.'),
  tile(8, 'medios', 'Medios', 'Portada de diario', 'Periódico estilizado.', '📺', '#2c3e50', 'La prensa habla de ti: +4 influencia y +3 popularidad, o pagas S/ 8 para el doble.'),
  tile(9, 'oposicion', 'Oposición', 'Moción en el hemiciclo', 'Lupa y micrófonos.', '🗣️', '#95a5a6', 'La oposición arremete: pierdes 4 de apoyo político o pagas 6 de influencia para mitigar.'),
  tile(10, 'elecciones', 'Elecciones', 'Jornada electoral', 'Urna estilizada.', '🗳️', '#c0392b', '¡Elecciones nacionales! Se resuelve la contienda entre todos los jugadores.'),
  tile(11, 'investigacion', 'Investigación', 'Fiscalía de ficción', 'Carpeta sellada.', '🔎', '#7d3c98', 'Las instituciones (ficticias) te observan: si tu riesgo judicial es alto, avanza una investigación.'),
  tile(12, 'mercado', 'Mercado', 'Bolsa y comercio', 'Ticker abstracto.', '📊', '#16a085', 'El mercado abre: compra o vende un activo.'),
  tile(13, 'alianza', 'Alianza', 'Pacto de salón', 'Dos manos estrechadas.', '🤝', '#e74c3c', 'Se te ofrece formar una alianza con un grupo de interés ficticio.'),
  tile(14, 'riesgo', 'Riesgo', 'Zona gris', 'Callejón sombreado.', '⚠️', '#d35400', 'Roba una carta de Riesgo: beneficio rápido a cambio de exposición.'),
  tile(15, 'economia', 'Economía', 'Coyuntura', 'Grillas de indicadores.', '💹', '#1e8449', 'Roba una carta de Evento Económico.'),
  tile(16, 'proyecto', 'Proyecto', 'Megaobra regional', 'Puente estilizado.', '🌉', '#f39c12', 'Se te ofrece un proyecto de mayor envergadura.'),
  tile(17, 'escandalo', 'Escándalo', 'Portada bomba', 'Fogonazo.', '💥', '#922b21', 'Roba una carta de Escándalo (nivel de riesgo).'),
  tile(18, 'evento_internacional', 'Evento Internacional', 'Titular del exterior', 'Globo terráqueo.', '🌎', '#2e86c1', 'Roba una carta internacional: mercado o diplomacia.'),
  tile(19, 'tribunal', 'Tribunal', 'Sala de audiencias', 'Martillo y báscula.', '⚖️', '#6c3483', 'Se resuelve el frente judicial: defiéndete o paga para reducir riesgo.'),
  tile(20, 'oportunidad', 'Oportunidad', 'Ventana política', 'Puerta abierta.', '🚪', '#f1c40f', 'Roba una carta de Oportunidad.'),
  tile(21, 'region', 'Región', 'Festival andino', 'Danza estilizada.', '🥁', '#229954', 'Evento regional: +6 popularidad si tu popularidad es menor a 60.'),
  tile(22, 'campana', 'Campaña', 'Caravana', 'Tren de apoyo.', '🎪', '#e67e22', 'Ganas +4 de popularidad, o pagas S/ 10 para ganar +12.'),
  tile(23, 'congreso', 'Congreso', 'Comisión parlamentaria', 'Tribuna de comisiones.', '📋', '#7f8c8d', 'Negocia: 5 de influencia a cambio de +8 apoyo político.'),
  tile(24, 'inversion', 'Inversión', 'Socio estratégico', 'Brújula.', '🧭', '#2980b9', 'Se te ofrece comprar un activo a precio preferente.'),
  tile(25, 'crisis', 'Crisis', 'Paro nacional', 'Camiones bloqueando.', '🚛', '#b03a2e', 'Crisis social: -6 popularidad o gastas S/ 12 para reducirla a -2.'),
  tile(26, 'elecciones', 'Elecciones', 'Segunda vuelta', 'Dos banderas.', '🏁', '#c0392b', '¡Nueva jornada electoral!'),
  tile(27, 'palacio', 'Palacio de Gobierno', 'Casa de Gobierno', 'Fachada institucional estilizada.', '🏦', '#212f3d', 'Meta de la etapa de gobierno: el presidente reside aquí durante su mandato.'),
];

function tile(
  id: number,
  kind: TileKind,
  nombre: string,
  subtitulo: string,
  _descripcion: string,
  icono: string,
  color: string,
  efecto: string,
): TileDef {
  return { id, kind, nombre, subtitulo, descripcion: efecto, icono, color };
}

export const BOARD_SIZE = BOARD.length;

/** Posición inicial de todos los jugadores. */
export const START_POSITION = 0;
