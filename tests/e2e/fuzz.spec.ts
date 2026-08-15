import { test, expect } from '@playwright/test';
import { capturarErrores, erroresReales } from './helpers';

/**
 * FUZZ: juega partidas completas IA vs IA (3 jugadores) recorriendo TODO el
 * juego (casillas, cartas, elecciones, investigaciones, mandatos) y verifica
 * que no se produzca ningún error de consola ni excepción de runtime.
 */
async function jugarPartidaCompleta(page: import('@playwright/test').Page, errores: string[]) {
  capturarErrores(page, errores);
  await page.goto('/');
  await page.getByRole('button', { name: /Nueva partida/ }).click();

  // 3 jugadores, todos IA, sin tutorial.
  await page.locator('select').first().selectOption({ label: '3 jugadores' });
  const tutorial = page.getByRole('checkbox');
  if (await tutorial.count()) await tutorial.uncheck();

  const slots = page.locator('.roster-slot');
  const n = await slots.count();
  for (let i = 0; i < Math.min(n, 3); i++) {
    await slots.nth(i).locator('select').nth(0).selectOption('ia');
  }

  await page.getByRole('button', { name: /Comenzar la campaña/ }).click();
  await expect(page.locator('.board-area')).toBeVisible();

  // La partida NO puede ganarse de inmediato: tras el primer avance IA,
  // la pantalla de resultado no debe aparecer todavía.
  const primerAvance = page.getByRole('button', { name: /Continuar \(IA\)/ });
  if ((await primerAvance.count()) && (await primerAvance.isVisible())) {
    await primerAvance.click();
    await page.waitForTimeout(800);
    expect(await page.locator('.result-hero').count()).toBe(0);
  }

  // Avanzar hasta el resultado o hasta el límite de intentos.
  let guard = 0;
  let alResultado = false;
  while (guard++ < 500) {
    const cont = page.getByRole('button', { name: /Continuar \(IA\)/ });
    if ((await cont.count()) && (await cont.isVisible())) {
      await cont.click();
      await page.waitForTimeout(60);
    } else if (await page.locator('.result-hero').count()) {
      alResultado = true;
      break;
    } else {
      await page.waitForTimeout(150);
    }
    if (guard % 30 === 0) await page.waitForTimeout(100);
  }
  return alResultado;
}

test('fuzz 1: partida IA vs IA completa sin errores de runtime', async ({ page }) => {
  const errores: string[] = [];
  const alResultado = await jugarPartidaCompleta(page, errores);
  expect(erroresReales(errores), `errores: ${erroresReales(errores).join(' | ')}`).toEqual([]);
  expect(alResultado, 'la partida debió llegar a la pantalla de resultado').toBe(true);
}, 120_000);

test('fuzz 2: partida IA vs IA completa (segunda ejecución)', async ({ page }) => {
  const errores: string[] = [];
  const alResultado = await jugarPartidaCompleta(page, errores);
  expect(erroresReales(errores), `errores: ${erroresReales(errores).join(' | ')}`).toEqual([]);
  expect(alResultado, 'la partida debió llegar a la pantalla de resultado').toBe(true);
}, 120_000);

test('fuzz 3: partida IA vs IA completa (tercera ejecución)', async ({ page }) => {
  const errores: string[] = [];
  const alResultado = await jugarPartidaCompleta(page, errores);
  expect(erroresReales(errores), `errores: ${erroresReales(errores).join(' | ')}`).toEqual([]);
  expect(alResultado, 'la partida debió llegar a la pantalla de resultado').toBe(true);
}, 120_000);

test('fuzz 4: partida IA vs IA completa (cuarta ejecución)', async ({ page }) => {
  const errores: string[] = [];
  const alResultado = await jugarPartidaCompleta(page, errores);
  expect(erroresReales(errores), `errores: ${erroresReales(errores).join(' | ')}`).toEqual([]);
  expect(alResultado, 'la partida debió llegar a la pantalla de resultado').toBe(true);
}, 120_000);

test('fuzz 5: partida IA vs IA completa (quinta ejecución)', async ({ page }) => {
  const errores: string[] = [];
  const alResultado = await jugarPartidaCompleta(page, errores);
  expect(erroresReales(errores), `errores: ${erroresReales(errores).join(' | ')}`).toEqual([]);
  expect(alResultado, 'la partida debió llegar a la pantalla de resultado').toBe(true);
}, 120_000);
