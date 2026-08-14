import type { GameState, ObjectiveDef, Player } from '../engine/types';

/**
 * "OBJETIVOS DE PODER" — sistema de objetivos personales de
 * "PERÚ: LA RUTA DEL PODER" (original, no copia de ningún juego).
 *
 * Nota de diseño: las condiciones son funciones puras evaluadas sobre
 * el estado; al serializar la partida solo se guardan los ids y las
 * funciones se restauran desde este mapa.
 */

export const OBJECTIVES: ObjectiveDef[] = [
  {
    id: 'poder1',
    titulo: 'Control político',
    descripcion: 'Alcanza 80 de influencia y mantén 3 alianzas activas.',
    tipo: 'condicion',
    recompensa: 20,
    condicion: (p, _g) => p.resources.influencia >= 80 && p.alliances.length >= 3,
  },
  {
    id: 'poder2',
    titulo: 'Palacio',
    descripcion: 'Conviértete en presidente de la República.',
    tipo: 'logro',
    recompensa: 15,
    condicion: (p, _g) => p.isPresident,
  },
  {
    id: 'poder3',
    titulo: 'Mano de hierro',
    descripcion: 'Alcanza 80 de poder político.',
    tipo: 'recurso',
    recompensa: 18,
    condicion: (p, _g) => p.resources.poder >= 80,
  },
  {
    id: 'popularidad1',
    titulo: 'Querido por el pueblo',
    descripcion: 'Alcanza 80 de popularidad.',
    tipo: 'recurso',
    recompensa: 18,
    condicion: (p, _g) => p.resources.popularidad >= 80,
  },
  {
    id: 'popularidad2',
    titulo: 'Regreso',
    descripcion: 'Después de perder 30 de popularidad acumulada, recupera al menos 60.',
    tipo: 'condicion',
    recompensa: 22,
    condicion: (p, _g) => p.stats.popularidadPerdida >= 30 && p.resources.popularidad >= 60,
  },
  {
    id: 'economia1',
    titulo: 'Fortuna personal',
    descripcion: 'Acumula 150 de dinero.',
    tipo: 'recurso',
    recompensa: 20,
    condicion: (p, _g) => p.resources.dinero >= 150,
  },
  {
    id: 'economia2',
    titulo: 'Imperio',
    descripcion: 'Posee 4 activos al mismo tiempo.',
    tipo: 'logro',
    recompensa: 20,
    condicion: (p, _g) => p.assets.length >= 4,
  },
  {
    id: 'economia3',
    titulo: 'Inversionista',
    descripcion: 'Invierte 40 o más en activos a lo largo de la partida.',
    tipo: 'condicion',
    recompensa: 15,
    condicion: (p, _g) => p.stats.invertido >= 40,
  },
  {
    id: 'legado1',
    titulo: 'Constructor',
    descripcion: 'Completa 3 proyectos públicos.',
    tipo: 'logro',
    recompensa: 20,
    condicion: (p, _g) => p.stats.proyectosCompletados >= 3,
  },
  {
    id: 'legado2',
    titulo: 'Gran Obra',
    descripcion: 'Completa un proyecto que cueste 40 o más.',
    tipo: 'condicion',
    recompensa: 18,
    condicion: (p, _g) => p.projects.some((x) => x.estado === 'completado' && x.costo >= 40),
  },
  {
    id: 'legado3',
    titulo: 'Huella eterna',
    descripcion: 'Completa 5 proyectos a lo largo de la partida.',
    tipo: 'logro',
    recompensa: 30,
    condicion: (p, _g) => p.stats.proyectosCompletados >= 5,
  },
  {
    id: 'supervivencia1',
    titulo: 'Supervivencia',
    descripcion: 'Completa un mandato presidencial completo.',
    tipo: 'logro',
    recompensa: 25,
    condicion: (p, _g) => p.stats.mandatosCompletados >= 1,
  },
  {
    id: 'supervivencia2',
    titulo: 'Inmaculado',
    descripcion: 'Nunca llegues a una investigación formal.',
    tipo: 'condicion',
    recompensa: 20,
    condicion: (p, _g) =>
      !p.investigations.some((i) =>
        ['investigacion_preliminar', 'investigacion_formal'].includes(i.estado),
      ),
  },
  {
    id: 'supervivencia3',
    titulo: 'Técnica',
    descripcion: 'Termina la partida sin haber quebrado.',
    tipo: 'condicion',
    recompensa: 12,
    condicion: (p, _g) => !p.quiebra,
  },
  {
    id: 'influencia1',
    titulo: 'Maestro del juego',
    descripcion: 'Alcanza 75 de influencia y 60 de apoyo político.',
    tipo: 'condicion',
    recompensa: 22,
    condicion: (p, _g) => p.resources.influencia >= 75 && p.resources.apoyoPolitico >= 60,
  },
  {
    id: 'alianza1',
    titulo: 'Tejedor de pactos',
    descripcion: 'Mantén 3 alianzas activas a la vez.',
    tipo: 'logro',
    recompensa: 15,
    condicion: (p, _g) => p.alliances.length >= 3,
  },
  {
    id: 'deuda1',
    titulo: 'Limpio de deudas',
    descripcion: 'Queda sin deuda y conserva 50 de dinero.',
    tipo: 'recurso',
    recompensa: 18,
    condicion: (p, _g) => p.resources.deuda === 0 && p.resources.dinero >= 50,
  },
  {
    id: 'eleccion1',
    titulo: 'Vencedor',
    descripcion: 'Gana 2 elecciones presidenciales.',
    tipo: 'logro',
    recompensa: 25,
    condicion: (p, _g) => p.stats.ganadoElecciones >= 2,
  },
  {
    id: 'eleccion2',
    titulo: 'Sobreviviente del balotaje',
    descripcion: 'Gana unas elecciones tras una segunda vuelta.',
    tipo: 'condicion',
    recompensa: 20,
    condicion: (p, _g) => p.electionResults.some((r) => r.result === 'segunda_vuelta'),
  },
  {
    id: 'investigacion1',
    titulo: 'Absuelto',
    descripcion: 'Supera una investigación en su resolución.',
    tipo: 'logro',
    recompensa: 18,
    condicion: (p, _g) => p.stats.investigacionesSuperadas >= 1,
  },
  {
    id: 'crisis1',
    titulo: 'Navegante de tormentas',
    descripcion: 'Sufre 3 escándalos y sigue en carrera.',
    tipo: 'logro',
    recompensa: 20,
    condicion: (p, _g) => p.stats.escandalosSufridos >= 3 && !p.eliminado,
  },
  {
    id: 'poder4',
    titulo: 'Al filo del abismo',
    descripcion: 'Ten 60 o más de riesgo institucional y sigue activo.',
    tipo: 'condicion',
    recompensa: 14,
    condicion: (p, _g) => p.resources.riesgoInstitucional >= 60 && !p.eliminado,
  },
  {
    id: 'dinero1',
    titulo: 'Tesoro de campaña',
    descripcion: 'Ten 100 de dinero y no más de 10 de deuda.',
    tipo: 'recurso',
    recompensa: 18,
    condicion: (p, _g) => p.resources.dinero >= 100 && p.resources.deuda <= 10,
  },
  {
    id: 'popularidad3',
    titulo: 'Favorito permanente',
    descripcion: 'Mantén 65 o más de popularidad al final de una ronda completa.',
    tipo: 'condicion',
    recompensa: 20,
    condicion: (p, _g) => p.resources.popularidad >= 65 && _g.ronda >= 3,
  },
];

export const OBJECTIVE_MAP: Record<string, ObjectiveDef> = Object.fromEntries(
  OBJECTIVES.map((o) => [o.id, o]),
);

export const OBJECTIVE_IDS = OBJECTIVES.map((o) => o.id);

/** Evalúa si un jugador cumple un objetivo pendiente. */
export function checkObjective(p: Player, g: GameState, objectiveId: string): boolean {
  const def = OBJECTIVE_MAP[objectiveId];
  if (!def) return false;
  try {
    return def.condicion(p, g);
  } catch {
    return false;
  }
}
