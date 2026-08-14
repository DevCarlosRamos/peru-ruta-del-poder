import type { CharacterDef } from '../engine/types';

/**
 * Personajes de "PERÚ: LA RUTA DEL PODER".
 *
 * ADVERTENCIA LEGAL/CONTENIDO:
 * - Las estadísticas son valores de GAMEPLAY (mecánicas de juego), NO afirmaciones
 *   históricas ni evaluaciones de personas reales.
 * - Los personajes reales aparecen como personajes históricos dentro de una obra
 *   satírica de ficción. No se atribuyen delitos, condenas ni conductas reales.
 * - Las frases son parodias ficticias, no citas reales.
 * - "El/La Vencedor(a) 2026" es un personaje 100% ficticio creado para representar
 *   el resultado de las elecciones peruanas de 2026 sin adivinar personas.
 * - REQ-VERIFICACIÓN: fechas de mandato son de conocimiento público; verificar antes
 *   de publicar cualquier afirmación adicional.
 */
export const CHARACTERS: CharacterDef[] = [
  {
    id: 'fujimori',
    nombre: 'Alberto Fujimori',
    apodo: 'El Ingeniero',
    periodo: '1990–2000',
    rol: 'Presidente',
    estilo: 'Control institucional y choque antisistema.',
    stats: { poder: 9, influencia: 9, popularidad: 6, riesgo: 9 },
    habilidad: {
      nombre: 'Control institucional',
      descripcion:
        'Una vez por partida: elimina 20 de riesgo institucional y ganas +10 de apoyo político. Efecto exclusivamente mecánico.',
      activa: 'una_vez',
    },
    debilidad: {
      nombre: 'Legado polarizado',
      descripcion: 'Pierdes 3 de popularidad cada vez que asumes un mandato presidencial.',
    },
    recursosIniciales: { dinero: 70, popularidad: 35, influencia: 30, poder: 20, apoyoPolitico: 15 },
    dificultad: 1,
    estrategia: 'Controla el riesgo institucional con tu habilidad y acumula poder e influencia antes de las elecciones.',
    frase: '“Yo no vengo a prometer, vengo a… administrar el caos.”',
    color: '#c0392b',
    emoji: '🛠️',
  },
  {
    id: 'toledo',
    nombre: 'Alejandro Toledo',
    apodo: 'El Cholo',
    periodo: '2001–2006',
    rol: 'Presidente',
    estilo: 'Momento de esperanza y capital social.',
    stats: { poder: 6, influencia: 7, popularidad: 8, riesgo: 6 },
    habilidad: {
      nombre: 'Momento de esperanza',
      descripcion:
        'Al ganar unas elecciones ganas +12 de popularidad y +5 de apoyo político. Efecto mecánico.',
      activa: 'pasiva',
    },
    debilidad: {
      nombre: 'Sombras del pasado',
      descripcion:
        'Cada vez que tu riesgo judicial supera 50, pierdes 5 de influencia de forma permanente.',
    },
    recursosIniciales: { dinero: 55, popularidad: 40, influencia: 25, poder: 10, apoyoPolitico: 15 },
    dificultad: 2,
    estrategia: 'Juega a la popularidad, gana elecciones tempranas y evita que el riesgo judicial suba.',
    frase: '“¡Sí se puede… armar una bancada!”',
    color: '#16a085',
    emoji: '🥾',
  },
  {
    id: 'garcia',
    nombre: 'Alan García',
    apodo: 'El Demócrata',
    periodo: '1985–1990 · 2006–2011',
    rol: 'Presidente',
    estilo: 'Oratoria clásica y segunda oportunidad.',
    stats: { poder: 7, influencia: 8, popularidad: 7, riesgo: 8 },
    habilidad: {
      nombre: 'Oratoria de tribuna',
      descripcion:
        'Tus campañas rinden un 50% más de popularidad (redondea hacia arriba). Efecto mecánico.',
      activa: 'pasiva',
    },
    debilidad: {
      nombre: 'Tormenta perfecta',
      descripcion: 'En cada crisis económica pierdes 10 de influencia adicional.',
    },
    recursosIniciales: { dinero: 60, popularidad: 35, influencia: 30, poder: 15, apoyoPolitico: 15 },
    dificultad: 2,
    estrategia: 'Invierte en campaña para multiplicar tu popularidad; ten reservas para crisis.',
    frase: '“La coyuntura nos exige grandeza, o al menos, un buen discurso.”',
    color: '#8e44ad',
    emoji: '🎤',
  },
  {
    id: 'humala',
    nombre: 'Ollanta Humala',
    apodo: 'El Nacionalista',
    periodo: '2011–2016',
    rol: 'Presidente',
    estilo: 'Pactos amplios y coaliciones.',
    stats: { poder: 6, influencia: 6, popularidad: 6, riesgo: 5 },
    habilidad: {
      nombre: 'Gran transformación',
      descripcion:
        'Tus alianzas rinden un 50% más de apoyo político. Efecto mecánico.',
      activa: 'pasiva',
    },
    debilidad: {
      nombre: 'Riesgo compartido',
      descripcion: 'En crisis económicas pierdes 5 de popularidad adicional.',
    },
    recursosIniciales: { dinero: 55, popularidad: 40, influencia: 20, poder: 15, apoyoPolitico: 20 },
    dificultad: 3,
    estrategia: 'Construye alianzas pronto; necesitas la coalición para compensar tu menor poder.',
    frase: '“Gobernaré con todos, especialmente con quienes me aplaudan.”',
    color: '#e67e22',
    emoji: '🤝',
  },
  {
    id: 'ppk',
    nombre: 'Pedro Pablo Kuczynski',
    apodo: 'El Banquero',
    periodo: '2016–2018',
    rol: 'Presidente',
    estilo: 'Tecnocracia y apertura de mercado.',
    stats: { poder: 6, influencia: 9, popularidad: 5, riesgo: 7 },
    habilidad: {
      nombre: 'Conexiones globales',
      descripcion:
        'Recibes +4 de ingreso pasivo adicional cada inicio de turno. Efecto mecánico.',
      activa: 'pasiva',
    },
    debilidad: {
      nombre: 'Minoría en el Congreso',
      descripcion: 'Comienzas cada mandato con 10 puntos menos de apoyo político.',
    },
    recursosIniciales: { dinero: 90, popularidad: 25, influencia: 35, poder: 10, apoyoPolitico: 10 },
    dificultad: 2,
    estrategia: 'Acumula dinero e influencia; compensa con alianzas tu debilidad congresal.',
    frase: '“Con orden y tecnología, todo se puede arreglar… en teoría.”',
    color: '#2980b9',
    emoji: '📈',
  },
  {
    id: 'vizcarra',
    nombre: 'Martín Vizcarra',
    apodo: 'El Profesor',
    periodo: '2018–2020',
    rol: 'Presidente',
    estilo: 'Reforma institucional y frescura.',
    stats: { poder: 7, influencia: 6, popularidad: 8, riesgo: 6 },
    habilidad: {
      nombre: 'Reformista',
      descripcion:
        'Tus proyectos completados rinden un 50% más de popularidad. Efecto mecánico.',
      activa: 'pasiva',
    },
    debilidad: {
      nombre: 'Congreso hostil',
      descripcion: 'Pierdes 5 de apoyo político al inicio de cada mandato.',
    },
    recursosIniciales: { dinero: 50, popularidad: 40, influencia: 25, poder: 12, apoyoPolitico: 10 },
    dificultad: 2,
    estrategia: 'Completa proyectos para disparar tu popularidad; cuida tu apoyo congresal.',
    frase: '“La ciudadanía pide reformas, y yo pido un momento de silencio.”',
    color: '#27ae60',
    emoji: '📚',
  },
  {
    id: 'castillo',
    nombre: 'Pedro Castillo',
    apodo: 'El Maestro',
    periodo: '2021–2022',
    rol: 'Presidente',
    estilo: 'Discurso de base y antielitismo.',
    stats: { poder: 5, influencia: 5, popularidad: 8, riesgo: 8 },
    habilidad: {
      nombre: 'Base popular',
      descripcion: 'Tus campañas cuestan un 30% menos (redondea hacia arriba). Efecto mecánico.',
      activa: 'pasiva',
    },
    debilidad: {
      nombre: 'Tormentas en palacio',
      descripcion: 'Si tu riesgo institucional supera 50, pierdes 5 de influencia.',
    },
    recursosIniciales: { dinero: 45, popularidad: 45, influencia: 15, poder: 8, apoyoPolitico: 15 },
    dificultad: 3,
    estrategia: 'Popularidad barata, pero protege tu influencia: no acumules riesgo sin red.',
    frase: '“¡Pueblo, campesino, ronderos y… otros aliados!”',
    color: '#f1c40f',
    emoji: '🧢',
  },
  {
    id: 'boluarte',
    nombre: 'Dina Boluarte',
    apodo: 'La Continuista',
    periodo: '2022–2026',
    rol: 'Presidenta',
    estilo: 'Continuidad institucional y gestión de emergencias.',
    stats: { poder: 7, influencia: 6, popularidad: 4, riesgo: 7 },
    habilidad: {
      nombre: 'Continuidad institucional',
      descripcion:
        'Tu mandato dura 1 ronda extra y tu gasto de palacio se reduce a la mitad. Efecto mecánico.',
      activa: 'pasiva',
    },
    debilidad: {
      nombre: 'Aprobación de esquinas',
      descripcion: 'Comienzas con la popularidad más baja del tablero y te cuesta más subirla.',
    },
    recursosIniciales: { dinero: 60, popularidad: 20, influencia: 30, poder: 25, apoyoPolitico: 20 },
    dificultad: 3,
    estrategia: 'Aguanta: tu poder y mandato largo te permiten jugar a la resistencia y la supervivencia.',
    frase: '“La prioridad es la gobernabilidad, la simpatía vendrá después.”',
    color: '#34495e',
    emoji: '🏛️',
  },
  {
    id: 'vencedor2026',
    nombre: 'El/La Vencedor(a) 2026',
    apodo: 'La Página en Blanco',
    periodo: '2026–',
    rol: 'Personaje ficticio',
    estilo: 'Arquetipo satírico sin identidad real.',
    stats: { poder: 6, influencia: 7, popularidad: 6, riesgo: 6 },
    habilidad: {
      nombre: 'Página en blanco',
      descripcion:
        'Una vez por partida: ganas +6 de influencia al inicio de tu turno y reordenas tu campaña. Efecto mecánico.',
      activa: 'una_vez',
    },
    debilidad: {
      nombre: 'Sin historial',
      descripcion: 'Pierdes 5 de influencia la primera vez que sufres una crisis.',
    },
    recursosIniciales: { dinero: 60, popularidad: 30, influencia: 22, poder: 15, apoyoPolitico: 15 },
    dificultad: 2,
    estrategia: 'Flexible: aprovéchate de la oportunidad única y reacciona a la mesa.',
    frase: '“El Perú de 2026 merece lo mejor… y todavía estamos decidiendo quién soy.”',
    color: '#d35400',
    emoji: '🎭',
  },
];

export const CHARACTER_MAP: Record<string, CharacterDef> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c]),
);
