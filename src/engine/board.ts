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

/** Alianzas base (ficticias) que se ofrecen en la casilla Alianza (sin carta). */
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
      log(state, `${p.nombre} llega a una casilla de campaña.`, 'info', p.id);
      const card = drawCard(state, 'campana', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'congreso': {
      const card = drawCard(state, 'congreso', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'region': {
      const delta: ResourceDelta = { popularidad: p.resources.popularidad < 60 ? 6 : 4 };
      if (p.resources.popularidad < 50) delta.influencia = 2;
      applyDelta(p, delta);
      log(state, `${p.nombre} recorre la región: gana el cariño local.`, 'positivo', p.id);
      break;
    }
    case 'proyecto': {
      const card = drawCard(state, 'proyecto', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'inversion': {
      const card = drawCard(state, 'inversion', rng);
      if (card) resolveCard(state, card, p.id);
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
      const card = drawCard(state, 'oposicion', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'alianza': {
      const card = drawCard(state, 'alianza', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'economia': {
      const card = drawCard(state, 'economia', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'evento_nacional': {
      const card = drawCard(state, 'evento_nacional', rng);
      if (card) resolveCard(state, card, p.id);
      break;
    }
    case 'evento_internacional': {
      const card = drawCard(state, 'evento_internacional', rng);
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

/** Inicia un proyecto elegido por el jugador (desde la acción del turno). */
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

/** Crea una alianza para el jugador (sin carta; acción de turno). */
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


