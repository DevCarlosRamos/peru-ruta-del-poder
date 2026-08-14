/**
 * Modelo de datos del motor de juego.
 * Todo el estado de una partida es serializable a JSON (GameState).
 */

/** Recursos que todo jugador posee. Números enteros. */
export interface Resources {
  /** Millones de soles ficticios (S/ M). */
  dinero: number;
  /** 0-100. Aprobación ciudadana. */
  popularidad: number;
  /** 0-100. Capacidad de negociar, redes, medios. */
  influencia: number;
  /** 0-100. Fuerza política institucional. */
  poder: number;
  /** 0-100. Apoyo en el Congreso / bancada. */
  apoyoPolitico: number;
  /** 0-100. Exposición política ante crisis e instituciones. */
  riesgoInstitucional: number;
  /** 0-100. Exposición judicial (mecánica abstracta de juego). */
  riesgoJudicial: number;
  /** 0-∞. Deuda acumulada. */
  deuda: number;
}

export type ResourceKey = keyof Resources;

export type Rarity = 'comun' | 'poco_comun' | 'raro' | 'epico';

/** Etiqueta de procedencia del contenido en cartas y eventos. */
export type ContentTag = 'HISTORICO' | 'INVESTIGACION' | 'FICCION' | 'SATIRA';

export interface Asset {
  id: string;
  nombre: string;
  tipo: 'empresa' | 'medio' | 'propiedad' | 'inversion' | 'fondo_campana' | 'contrato' | 'negocio';
  costo: number;
  ingresoTurno: number;
  riesgo: number;
  descripcion: string;
  ficcion: boolean;
}

export type ProjectState = 'activo' | 'completado' | 'fallido' | 'abandonado';

export interface Project {
  id: string;
  nombre: string;
  costo: number;
  duracionTurnos: number;
  turnosRestantes: number;
  beneficio: number;
  popularidadGanada: number;
  influenciaGanada: number;
  riesgo: number;
  region: string;
  estado: ProjectState;
  descripcion: string;
  ficticio: boolean;
}

export interface Alliance {
  id: string;
  nombre: string;
  costoInfluencia: number;
  apoyoGanado: number;
  beneficioDinero: number;
  duracion: number;
  turnosRestantes: number;
  descripcion: string;
  ficticio: boolean;
}

export type InvestigationState =
  | 'sin_investigacion'
  | 'rumor'
  | 'investigacion_preliminar'
  | 'investigacion_formal'
  | 'resolucion';

export interface Investigation {
  id: string;
  titulo: string;
  estado: InvestigationState;
  origen: 'evento' | 'carta' | 'riesgo' | 'decision' | 'tribunal';
  turnosDeEspera: number;
  tag: ContentTag;
  descripcion: string;
}

export type AIProfileName =
  | 'agresivo'
  | 'conservador'
  | 'oportunista'
  | 'economico'
  | 'populista'
  | 'negociador'
  | 'arriesgado';

export interface AIProfile {
  nombre: AIProfileName;
  /** 0-1: propensión a usar acciones de alto riesgo. */
  agresividad: number;
  /** 0-1: propensión a invertir y construir economía. */
  inversion: number;
  /** 0-1: propensión a gastar en campaña/popularidad. */
  populismo: number;
  /** 0-1: propensión a crear alianzas. */
  diplomacia: number;
  /** 0-1: tolerancia al riesgo judicial antes de defenderse. */
  tolerancia: number;
}

export interface CharacterDef {
  id: string;
  nombre: string;
  apodo: string;
  periodo: string;
  rol: string;
  estilo: string;
  stats: { poder: number; influencia: number; popularidad: number; riesgo: number };
  habilidad: { nombre: string; descripcion: string; activa: 'pasiva' | 'una_vez' };
  debilidad: { nombre: string; descripcion: string };
  recursosIniciales: Partial<Resources>;
  dificultad: 1 | 2 | 3;
  estrategia: string;
  frase: string;
  color: string;
  emoji: string;
}

export type PlayerKind = 'humano' | 'ia';

export interface Player {
  id: string;
  nombre: string;
  kind: PlayerKind;
  aiProfile?: AIProfileName;
  characterId: string;
  resources: Resources;
  position: number;
  /** Orden de turno. */
  orden: number;
  activo: boolean;
  eliminado: boolean;
  quiebra: boolean;
  assets: Asset[];
  projects: Project[];
  alliances: Alliance[];
  investigations: Investigation[];
  objectives: string[];
  objectivesCompleted: string[];
  isPresident: boolean;
  /** Turnos de mandato restantes. -1 si no es presidente. */
  mandateTurns: number;
  mandateGoal: number;
  electionResults: { turno: number; score: number; result: string }[];
  bloqueadoPresidencia: number;
  skillsUsed: string[];
  stats: {
    popularidadPerdida: number;
    proyectosCompletados: number;
    investigacionesSuperadas: number;
    escandalosSufridos: number;
    mandatosCompletados: number;
    alianzasActivas: number;
    ganadoElecciones: number;
    invertido: number;
  };
}

export type TileKind =
  | 'salida'
  | 'campana'
  | 'congreso'
  | 'region'
  | 'proyecto'
  | 'inversion'
  | 'crisis'
  | 'investigacion'
  | 'escandalo'
  | 'tribunal'
  | 'medios'
  | 'alianza'
  | 'oposicion'
  | 'economia'
  | 'mercado'
  | 'evento_nacional'
  | 'evento_internacional'
  | 'oportunidad'
  | 'riesgo'
  | 'elecciones'
  | 'palacio';

export interface TileDef {
  id: number;
  kind: TileKind;
  nombre: string;
  subtitulo: string;
  /** Qué sucede al caer (efecto de juego). */
  descripcion: string;
  icono: string;
  color: string;
  /** Categorías de cartas que puede activar esta casilla. */
  cartas?: CardCategory[];
  /** Posibles recompensas (texto para la inspección). */
  recompensas?: string[];
  /** Posibles riesgos (texto para la inspección). */
  riesgos?: string[];
  /** Decisiones disponibles al caer (texto para la inspección). */
  decisiones?: string[];
}

export type CardCategory =
  | 'oportunidad'
  | 'inversion'
  | 'crisis'
  | 'eleccion'
  | 'escandalo'
  | 'investigacion'
  | 'alianza'
  | 'economia'
  | 'proyecto'
  | 'oposicion'
  | 'evento_nacional'
  | 'evento_internacional'
  | 'campana'
  | 'congreso'
  | 'decision_presidencial';

export interface CardDef {
  id: string;
  nombre: string;
  categoria: CardCategory;
  tag: ContentTag;
  descripcion: string;
  contexto: string;
  /** Efecto directo (cartas automáticas o "aceptar la situación"). */
  efectos: ResourceDelta;
  costo: number;
  recompensa: number;
  riesgo: { institucional: number; judicial: number };
  condiciones?: string;
  rareza: Rarity;
  impacto: 'bajo' | 'medio' | 'alto';
  textoCorto: string;
  /** Opciones de decisión ricas (costos, probabilidades, éxito/fallo). */
  decision?: { opciones: CardDecisionOption[] };
  /** Probabilidad de éxito (0-1) cuando la carta tiene un único lance. */
  probabilidad?: number;
  /** Si es true, el jugador puede guardarla en su mano para jugarla después. */
  guardable?: boolean;
  /** Turnos de espera entre usos (0 = sin cooldown). */
  cooldown?: number;
  /** Fuente/contexto cuando aplica (cartas históricas). */
  fuente?: string;
  requiereVerificacion?: string;
}

/** Opción de decisión de una carta (riesgo/recompensa real). */
export interface CardDecisionOption {
  texto: string;
  /** Coste de dinero al elegir. */
  costoDinero?: number;
  /** Coste de influencia al elegir. */
  costoInfluencia?: number;
  /** Probabilidad de éxito (0-1). Si no se define, el efecto es determinista. */
  probabilidad?: number;
  /** Efectos que se aplican siempre al elegir. */
  efectosFijos?: ResourceDelta;
  /** Efectos si el lance tiene éxito. */
  efectosExito?: ResourceDelta;
  /** Efectos si el lance falla. */
  efectosFallo?: ResourceDelta;
  /** Meta para el motor. */
  accion?: string;
}

/** Cambio aplicable a recursos. Solo se incluyen los que cambian. */
export type ResourceDelta = Partial<Record<ResourceKey, number>>;

export interface ObjectiveDef {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'recurso' | 'logro' | 'condicion';
  /** Verificación sobre el estado del jugador. Se evalúa con el state completo. */
  condicion: (p: Player, g: GameState) => boolean;
  recompensa: number;
}

export type Phase =
  | 'config'
  | 'turno_inicio'
  | 'roll'
  | 'movimiento'
  | 'casilla'
  | 'decision'
  | 'check'
  | 'fin_turno'
  | 'investigacion_resolucion'
  | 'elecciones'
  | 'gobierno'
  | 'fin_partida';

export type ElectionPhase =
  | 'inactiva'
  | 'campaña'
  | 'primera_vuelta'
  | 'segunda_vuelta'
  | 'resultado';

export interface ElectionState {
  fase: ElectionPhase;
  turno: number;
  participantes: string[];
  resultadosPrimeraVuelta: { playerId: string; votos: number }[];
  finalistas: string[];
  ganadorId: string | null;
  motivo: string;
  campaignIndex: number;
  campaignChosen: Record<string, boolean>;
  campaignBonus: Record<string, number>;
}

export interface PendingDecision {
  id: string;
  jugadorId: string;
  tipo:
    | 'accion'
    | 'tile'
    | 'carta'
    | 'carta_decision'
    | 'proyecto'
    | 'inversion'
    | 'alianza'
    | 'riesgo'
    | 'investigacion_resolucion'
    | 'defensa'
    | 'vacancia';
  titulo: string;
  descripcion: string;
  opciones: {
    texto: string;
    efecto?: ResourceDelta;
    consecuencias?: string;
    requiereDinero?: number;
    requiereInfluencia?: number;
    tag?: string;
    /** meta para que el engine aplique la lógica correspondiente */
    accion?: string;
    /** Metadatos de riesgo/recompensa para la UI de cartas. */
    probabilidad?: number;
    costoDinero?: number;
    costoInfluencia?: number;
  }[];
  cardId?: string;
  tileId?: number;
}

export interface MarketEntry {
  assetId: string;
  precio: number;
  oferta: 'subida' | 'baja' | 'estable';
  nombre: string;
  tipo: string;
  ingresoTurno: number;
  riesgo: number;
  descripcion: string;
}

export interface HistoryEntry {
  turno: number;
  ronda: number;
  jugadorId: string;
  mensaje: string;
  tipo: 'info' | 'positivo' | 'negativo' | 'crisis' | 'eleccion' | 'sistema';
}

export type WinReason =
  | 'presidencia'
  | 'mandato_completo'
  | 'objetivos'
  | 'puntuacion'
  | 'supervivencia';

export interface GameConfig {
  seed: number;
  seedLabel: string;
  maxRounds: number;
  playerCount: number;
  tutorial: boolean;
  ai: boolean;
}

export interface GameState {
  version: number;
  id: string;
  config: GameConfig;
  ronda: number;
  turnoGlobal: number;
  phase: Phase;
  currentPlayerId: string;
  players: Player[];
  board: TileDef[];
  market: MarketEntry[];
  deck: string[];
  drawPile: string[];
  discardPile: string[];
  hand: Record<string, string[]>;
  currentCardId: string | null;
  pendingDecision: PendingDecision | null;
  election: ElectionState;
  economia: {
    inflacion: number;
    mercado: 'alcista' | 'bajista' | 'estable';
    periodoFiscal: number;
    impuestosRecibidos: number;
  };
  events: HistoryEntry[];
  winner: { playerId: string; motivo: WinReason; puntos: number } | null;
  log: HistoryEntry[];
  autoBattle: boolean;
  tutorialStep: number;
  presidentId: string | null;
  objectivePool: string[];
  objectivePoolDefs: string[];
  turnosEnGobierno: number;
  terminada: boolean;
  /** Estado interno del RNG para poder restaurar la secuencia de azar. */
  rngState?: number;
}
