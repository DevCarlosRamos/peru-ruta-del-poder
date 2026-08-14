/**
 * Constantes de balance del juego.
 * Todas las cantidades del motor salen de aquí o de los datos de contenido.
 * Documentación de equilibrio en docs/BALANCE.md.
 */
export const BALANCE = {
  version: 1,

  /** Duración de una partida en rondas completas (cada ronda = 1 turno por jugador). */
  maxRounds: 18,

  /** Recursos iniciales por defecto (un jugador sin personaje asignado). */
  startResources: {
    dinero: 60,
    popularidad: 30,
    influencia: 20,
    poder: 10,
    apoyoPolitico: 10,
    riesgoInstitucional: 0,
    riesgoJudicial: 0,
    deuda: 0,
  },

  /** Dinero que se cobra cada vez que el jugador pasa por la casilla Salida (Plaza Central). */
  salida: 10,

  /** Ingreso fiscal por turno de gobierno del presidente. */
  presupuestoPorTurno: 12,

  /** Costo de mantenimiento por turno del presidente (gastos de palacio). */
  gastoPalacio: 4,

  /** Sueldo / ingresos pasivos básicos al iniciar el turno. */
  ingresoBase: 2,

  /** Tope de dinero a partir del cual el mercado empieza a mover inflación. */
  inflacionUmbral: 250,

  /** % de dinero que se pierde por inflación cuando supera el umbral. */
  inflacionPerdidaPct: 0.05,

  /** Deuda inicial permitida gratis cada ronda antes de penalizar. */
  deudaGratis: 10,

  /** Interés de la deuda (% del total) al inicio de cada ronda. */
  interesDeudaPct: 0.08,

  /** Riesgo institucional con el que un jugador comienza a recibir atención. */
  riesgoInstitucionalUmbralInvestigacion: 55,

  /** Riesgo judicial con el que se activa una investigación. */
  riesgoJudicialUmbralInvestigacion: 35,

  /** Probabilidad base por turno de abrir investigación si se supera el umbral. */
  probabilidadInvestigacionBase: 0.35,

  /** Uso de la probabilidad de investigación por nivel de riesgo adicional. */
  probabilidadInvestigacionExtra: 0.02,

  /** Umbral de riesgo institucional para crisis de vacancia presidencial. */
  vacanciaUmbral: 80,

  /** Probabilidad base de que el Congreso destituya en una vacancia. */
  vacanciaProbabilidadBase: 0.5,

  /** Penalización por perder la vacancia (mitigada por apoyo político). */
  vacanciaPenalidadPoder: 30,

  /** Objetivos que cada jugador elige al inicio. */
  objetivosPorJugador: 2,

  /** Dinero base entregado por completar un objetivo. */
  recompensaObjetivo: 15,

  /** Peso de la popularidad en el score electoral (0-1). */
  pesoElectoralPopularidad: 0.5,
  pesoElectoralInfluencia: 0.2,
  pesoElectoralApoyo: 0.15,
  pesoElectoralPoder: 0.15,
  penalidadElectoralRiesgo: 0.08,

  /** Bono electoral por alianza activa. */
  bonoElectoralAlianza: 4,

  /** Duración del mandato presidencial (en rondas completas). */
  duracionMandatoRondas: 3,

  /** Acciones máximas por turno. */
  maxAccionesTurno: 1,

  /** Costos y beneficios de acciones. */
  acciones: {
    campana: { costo: 10, popularidad: 12, influencia: 4 },
    proyecto: { influenciaCosto: 8 },
    alianza: { influenciaCosto: 12, apoyo: 10 },
    gestionRiesgosa: { dinero: 30, riesgoInstitucional: 12, riesgoJudicial: 8 },
    defenderNombre: { costo: 8, reduceRiesgoJudicial: 6 },
    pagarDeuda: { unidad: 1 },
  },

  /** Límite máximo de dinero que un jugador puede acumular (anti dinero infinito). */
  techoDinero: 500,

  /** Penalizaciones de quiebra. */
  quiebra: {
    umbral: -20,
    penalidadPoder: 15,
    penalidadPopularidad: 10,
  },
} as const;

/** Tope de longitud del historial de eventos (para evitar estados gigantes). */
export const MAX_HISTORY = 500;

/** Tope de tamaño de payload de guardado remoto (bytes) para el API D1. */
export const MAX_SAVE_BYTES = 1_500_000;

export const NOMBRE_JUEGO = 'PERÚ: LA RUTA DEL PODER';
