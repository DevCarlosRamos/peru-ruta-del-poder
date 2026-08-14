import { BALANCE } from './constants';
import type { GameState, PendingDecision, Player, ResourceDelta, TileKind } from './types';
import { applyDelta, getPlayer, log } from './utils';
import { BOARD, BOARD_SIZE } from '../data/board';
import { ASSET_MAP, ASSETS } from '../data/assets';
import { createProjects } from '../data/projects';
import { CHARACTER_MAP } from '../data/characters';
import { Rng } from './rng';
import { drawCard, resolveCard } from './cards';
import { startElection } from './election';
import { advanceInvestigation, tryOpenInvestigationByRisk } from './investigation';
import { riesgoJudicialAlto } from './risk';

/** Avanza la ficha del jugador `steps` casillas; cobra canon al pasar por la salida. */
export function movePlayer(state: GameState, playerId: string, steps: number): void {
  const p = getPlayer(state, playerId);
  const antes = p.position;
  p.position = (p.position + steps) % BOARD_SIZE;
  if (p.position < antes) {
    applyDelta(p, { dinero: BALANCE.salida });
    log(state, `${p.nombre} pasa por la Plaza Central y cobra el canon ciudadano (S/ ${BALANCE.salida}).`, 'positivo', p.id);
  }
}

/** Crea una decisión genérica para una casilla. */
function tileDecision(
  state: GameState,
  p: Player,
  titulo: string,
  descripcion: string,
  opciones: PendingDecision['opciones'],
): void {
  state.pendingDecision = {
    id: `tile_${state.turnoGlobal}_${p.id}`,
    jugadorId: p.id,
    tipo: 'tile',
    titulo,
    descripcion,
    opciones,
  };
}

/** Alianzas base (ficticias) que se ofrecen en la casilla Alianza. */
export const ALIANZAS_BASE = [
  { nombre: 'Movimiento Regional Flor y Viento', costoInfluencia: 12, apoyo: 10, duracion: 4 },
  { nombre: 'Coalición Técnica Parlamentaria', costoInfluencia: 10, apoyo: 8, duracion: 3 },
  { nombre: 'Movimiento Cívico Cercanía', costoInfluencia: 8, apoyo: 6, duracion: 3 },
];

export function allianceKey(nombre: string): string {
  return nombre.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

/** Resuelve la casilla en la que está el jugador actual. */
export function resolveTile(state: GameState, rng: Rng): void {
  const p = getPlayer(state, state.currentPlayerId);
  const tile = BOARD[p.position];

  switch (tile.kind as TileKind) {
    case 'salida': {
      applyDelta(p, { dinero: BALANCE.salida });
      log(state, `${p.nombre} está en la Plaza Central (S/ ${BALANCE.salida}).`, 'positivo', p.id);
      break;
    }
    case 'campana': {
      tileDecision(state, p, 'Campaña electoral', 'Aprovecha la plaza pública para ganar simpatías.', [
        { texto: 'Mitin exprés (+4 popularidad)', accion: 'campana_mitin' },
        { texto: 'Campaña completa (S/ 10 → +12 popularidad, +4 influencia)', accion: 'campana_paga', requiereDinero: 10 },
      ]);
      break;
    }
    case 'congreso': {
      tileDecision(state, p, 'Cabildeo en el Congreso', 'Negocia con bancadas para asegurar tu respaldo.', [
        { texto: 'Cabildeo (5 influencia → +8 apoyo político)', accion: 'congreso_cabildeo', requiereInfluencia: 5 },
        { texto: 'No negociar', accion: 'congreso_no' },
      ]);
      break;
    }
    case 'region': {
      const delta: ResourceDelta = { popularidad: 5 };
      if (p.resources.popularidad < 50) delta.influencia = 2;
      applyDelta(p, delta);
      log(state, `${p.nombre} recorre la región: gana el cariño local.`, 'positivo', p.id);
      break;
    }
    case 'proyecto': {
      const proyectos = createProjects().slice(0, 4);
      tileDecision(state, p, 'Iniciar un proyecto público', 'Elige una obra ficticia para impulsar (costo inmediato, beneficio al completarla).', [
        ...proyectos.map((pr) => ({
          texto: `${pr.nombre} (S/ ${pr.costo}, ${pr.duracionTurnos} turnos, +${pr.popularidadGanada} popularidad)`,
          accion: `proyecto_${pr.id}`,
          requiereDinero: pr.costo,
        })),
        { texto: 'No iniciar proyectos', accion: 'proyecto_no' },
      ]);
      break;
    }
    case 'inversion':
    case 'mercado': {
      const ofertas = state.market.slice(0, 2);
      tileDecision(state, p, 'Mercado de activos', 'Compra un activo para generar ingresos pasivos.', [
        ...ofertas.map((o) => ({
          texto: `${o.nombre} (S/ ${o.precio} → +${o.ingresoTurno}/turno)`,
          accion: `comprar_${o.assetId}`,
          requiereDinero: o.precio,
        })),
        { texto: 'No comprar', accion: 'comprar_no' },
      ]);
      break;
    }
    case 'crisis': {
      log(state, `${p.nombre} cae en una crisis: se revela una carta de crisis.`, 'crisis', p.id);
      const card = drawCard(state, 'crisis', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'investigacion': {
      const activa = p.investigations.find((i) => i.estado !== 'resolucion');
      if (activa) {
        advanceInvestigation(state, p.id);
      } else if (riesgoJudicialAlto(p)) {
        tryOpenInvestigationByRisk(state, p.id, rng);
      } else {
        log(state, `${p.nombre} pasa por la fiscalía (ficticia): sin novedades.`, 'info', p.id);
      }
      break;
    }
    case 'escandalo': {
      log(state, `${p.nombre} cae en un escándalo mediático.`, 'crisis', p.id);
      const card = drawCard(state, 'escandalo', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'tribunal': {
      const activa = p.investigations.find((i) => i.estado !== 'resolucion');
      if (activa) {
        tileDecision(state, p, 'Audiencia en el tribunal (ficticio)', 'Tu investigación llega a resolución. Decide cómo defenderte.', [
          { texto: 'Contratar una defensa sólida (S/ 8)', accion: 'tribunal_defiende', requiereDinero: 8 },
          { texto: 'Defenderte sin recursos', accion: 'tribunal_sin' },
        ]);
      } else {
        applyDelta(p, { riesgoJudicial: -5 });
        log(state, `${p.nombre}: el tribunal (ficticio) no tiene casos contra ti. Tu expediente se aligera.`, 'positivo', p.id);
      }
      break;
    }
    case 'medios': {
      tileDecision(state, p, 'Los medios hablan de ti', 'Aprovecha la tribuna mediática.', [
        { texto: 'Aparecer (+4 influencia, +3 popularidad)', accion: 'medios_gratis' },
        { texto: 'Campaña mediática pagada (S/ 8 → +8 influencia, +6 popularidad)', accion: 'medios_paga', requiereDinero: 8 },
      ]);
      break;
    }
    case 'oposicion': {
      tileDecision(state, p, 'La oposición arremete', 'La bancada opositora lanza una ofensiva.', [
        { texto: 'Mitigar con influencia (6 influencia → -1 apoyo)', accion: 'oposicion_mitiga', requiereInfluencia: 6 },
        { texto: 'Aguantar el golpe (-4 apoyo político)', accion: 'oposicion_aguanta' },
      ]);
      break;
    }
    case 'alianza': {
      tileDecision(state, p, 'Oportunidad de alianza', 'Un grupo de interés (ficticio) ofrece un pacto.', [
        ...ALIANZAS_BASE.map((a) => ({
          texto: `${a.nombre} (${a.costoInfluencia} influencia → +${a.apoyo} apoyo político)`,
          accion: `alianza_${allianceKey(a.nombre)}`,
          requiereInfluencia: a.costoInfluencia,
        })),
        { texto: 'Declinar el pacto', accion: 'alianza_no' },
      ]);
      break;
    }
    case 'economia': {
      const card = drawCard(state, 'evento_economico', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'evento_nacional': {
      const card = drawCard(state, 'evento_politico', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'evento_internacional': {
      const card = drawCard(state, 'mercado', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'oportunidad': {
      const card = drawCard(state, 'oportunidad', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'riesgo': {
      const card = drawCard(state, 'oportunidad', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'elecciones': {
      if (state.election.fase === 'inactiva') {
        log(state, `${p.nombre} llega a la casilla de elecciones: se convoca a la ciudadanía.`, 'eleccion', p.id);
        startElection(state, rng);
      } else {
        log(state, 'Las elecciones ya están en marcha.', 'eleccion', p.id);
      }
      break;
    }
    case 'palacio': {
      if (p.isPresident) {
        log(state, `${p.nombre} reside en Palacio de Gobierno.`, 'info', p.id);
      } else {
        applyDelta(p, { poder: 5, influencia: 3 });
        log(state, `${p.nombre} visita la Casa de Gobierno: el poder se respira. (+5 poder)`, 'positivo', p.id);
      }
      break;
    }
  }
}

/** Inicia un proyecto elegido por el jugador. */
export function startProject(state: GameState, playerId: string, projectId: string): boolean {
  const p = getPlayer(state, playerId);
  const base = createProjects().find((pr) => pr.id === projectId);
  if (!base) return false;
  if (p.resources.dinero < base.costo) return false;
  applyDelta(p, { dinero: -base.costo });
  p.stats.invertido += base.costo;
  p.projects.push({ ...base, turnosRestantes: base.duracionTurnos, estado: 'activo' });
  log(state, `${p.nombre} inicia el proyecto "${base.nombre}" (S/ ${base.costo}).`, 'positivo', p.id);
  return true;
}

/** Compra un activo del mercado. */
export function buyAsset(state: GameState, playerId: string, assetId: string, rng: Rng): boolean {
  const p = getPlayer(state, playerId);
  const entry = state.market.find((m) => m.assetId === assetId);
  if (!entry) return false;
  if (p.resources.dinero < entry.precio) return false;
  applyDelta(p, { dinero: -entry.precio });
  p.stats.invertido += entry.precio;
  const asset = ASSET_MAP[assetId];
  p.assets.push({ ...asset, costo: entry.precio });
  log(state, `${p.nombre} compra ${entry.nombre} (S/ ${entry.precio}).`, 'positivo', p.id);
  state.market = state.market.filter((m) => m.assetId !== assetId);
  repopulateMarket(state, rng);
  return true;
}

/** Repone el mercado hasta 2 activos aleatorios (determinista con el Rng). */
export function repopulateMarket(state: GameState, rng: Rng): void {
  const tomados = new Set(state.players.flatMap((pl) => pl.assets.map((a) => a.id)));
  const libres = ASSETS.filter((a) => !tomados.has(a.id) && !state.market.some((m) => m.assetId === a.id));
  while (state.market.length < 2 && libres.length > 0) {
    const a = libres.splice(rng.int(0, libres.length - 1), 1)[0];
    state.market.push({
      assetId: a.id,
      precio: a.costo,
      oferta: 'estable',
      nombre: a.nombre,
      tipo: a.tipo,
      ingresoTurno: a.ingresoTurno,
      riesgo: a.riesgo,
      descripcion: a.descripcion,
    });
  }
}

/** Crea una alianza para el jugador (casilla Alianza). */
export function createAlliance(state: GameState, playerId: string, key: string): boolean {
  const p = getPlayer(state, playerId);
  const base = ALIANZAS_BASE.find((a) => allianceKey(a.nombre) === key);
  if (!base) return false;
  if (p.resources.influencia < base.costoInfluencia) return false;
  const char = CHARACTER_MAP[p.characterId];
  const apoyo = char?.habilidad.nombre === 'Gran transformación' ? Math.ceil(base.apoyo * 1.5) : base.apoyo;
  applyDelta(p, { influencia: -base.costoInfluencia, apoyoPolitico: apoyo });
  p.alliances.push({
    id: `al_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    nombre: base.nombre,
    costoInfluencia: base.costoInfluencia,
    apoyoGanado: apoyo,
    beneficioDinero: 0,
    duracion: base.duracion,
    turnosRestantes: base.duracion,
    descripcion: 'Pacto ficticio de apoyo político.',
    ficticio: true,
  });
  log(state, `${p.nombre} firma alianza con "${base.nombre}" (+${apoyo} apoyo político).`, 'positivo', p.id);
  return true;
}

