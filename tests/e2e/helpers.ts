import type { Page } from '@playwright/test';
import { GameEngine } from '../../src/engine/gameEngine';
import type { GameState } from '../../src/engine/types';
import { serializeState } from '../../src/engine/serialization';

export const SAVE_KEY = 'peru-ruta-del-poder:save:v1';

/** Crea un estado de partida nuevo usando el motor real (determinista por semilla). */
export function nuevoEstado(seed = 42): GameState {
  const engine = new GameEngine(seed);
  return engine.createGame(
    { seed, seedLabel: 'e2e', maxRounds: 18, playerCount: 2, tutorial: false, ai: false },
    [
      { nombre: 'Test A', kind: 'humano', characterId: 'garcia' },
      { nombre: 'Test B', kind: 'ia', aiProfile: 'oportunista', characterId: 'vizcarra' },
    ],
  );
}

/** Clona un estado (JSON) para manipularlo sin mutar el original. */
export function clonar<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

/**
 * Inyecta un estado en localStorage y carga la partida desde la pantalla de inicio
 * (botón "Continuar partida").
 */
export async function cargarEstado(page: Page, state: GameState): Promise<void> {
  await page.addInitScript(
    ({ key, json }) => {
      try {
        localStorage.setItem(key, json);
      } catch {
        // sin almacenamiento disponible
      }
    },
    { key: SAVE_KEY, json: serializeState(state) },
  );
  await page.goto('/');
  await page.getByRole('button', { name: /Continuar partida/ }).click();
}

/** Captura errores de consola y excepciones no controladas de una página. */
export function capturarErrores(page: Page, errores: string[]): void {
  page.on('console', (msg) => {
    if (msg.type() === 'error') errores.push(msg.text());
  });
  page.on('pageerror', (err) => errores.push(err.message));
}

/** Filtra errores de terceros irrelevantes (recursos externos). */
export function erroresReales(errores: string[]): string[] {
  return errores.filter(
    (e) => !e.includes('Failed to load resource') && !e.includes('net::ERR_') && !e.includes('favicon'),
  );
}
