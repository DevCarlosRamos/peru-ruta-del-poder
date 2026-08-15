import { test, expect, Page } from '@playwright/test';

/**
 * Smoke test E2E: juega una partida real en el navegador contra la app
 * desplegada (o contra el preview local con E2E_URL).
 * Valida que la experiencia de mesa funcione de punta a punta.
 */

async function iniciarPartida(page: Page) {
  await page.goto('/');
  await expect(page.getByText('LA RUTA DEL PODER').first()).toBeVisible();
  await page.getByRole('button', { name: /Nueva partida/ }).click();
  // Desactivar el tutorial para un flujo de validación directo.
  const tutorial = page.getByRole('checkbox');
  if (await tutorial.count()) await tutorial.uncheck();
  await page.getByRole('button', { name: /Comenzar la campaña/ }).click();
  // La mesa debe renderizarse con el tablero protagonista.
  await expect(page.locator('.board-area')).toBeVisible();
  await expect(page.locator('.tile-box')).toHaveCount(28);
}

test('carga, inicia partida y muestra el tablero de mesa', async ({ page }) => {
  const errores: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errores.push(msg.text());
  });
  page.on('pageerror', (err) => errores.push(err.message));

  await iniciarPartida(page);

  // HUD de recursos visible.
  await expect(page.locator('.hud')).toBeVisible();
  // Contadores de mazo presentes.
  await expect(page.locator('.board-deck')).toContainText('🃏');
  await page.screenshot({ path: 'e2e-1-tablero.png' });

  // Aceptar posibles errores de terceros (fuentes, favicon) pero no JS del juego.
  const erroresReales = errores.filter((e) => !e.includes('Failed to load resource'));
  expect(erroresReales, `errores de consola: ${erroresReales.join(' | ')}`).toEqual([]);
});

test('juega un turno completo (turno → dado → casilla → decisión)', async ({ page }) => {
  await iniciarPartida(page);

  // 1) Comenzar turno.
  await page.getByRole('button', { name: /Comenzar turno/ }).click();
  // 2) Tirar el dado (el botón cambia tras comenzar el turno).
  await page.getByRole('button', { name: /Tirar el dado/ }).click();
  // La animación del dado aparece.
  await expect(page.locator('.dice-anim').first()).toBeVisible({ timeout: 4000 });

  // 3) La ficha se mueve casilla por casilla; el dado aterriza.
  await expect(page.locator('.dice-anim.settled').first()).toBeVisible({ timeout: 15_000 });

  // 4) Puede aparecer una carta (CardModal) o una decisión de casilla (DecisionModal).
  //    Si aparece algo, elegimos la primera opción y continuamos.
  try {
    await page.locator('.card-options .btn-option, .modal-options .btn-option').first().waitFor({ timeout: 6000 });
    await page.locator('.card-options .btn-option, .modal-options .btn-option').first().click();
    await expect(page.locator('.card-panel.resultado').first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /Continuar/ }).first().click();
  } catch {
    // Sin carta: seguir con la acción del turno o terminar.
    await page.screenshot({ path: 'e2e-2-sin-carta.png' });
  }

  // 5) Terminar el turno si está disponible.
  const terminar = page.getByRole('button', { name: /Terminar turno/ });
  if (await terminar.count()) {
    await terminar.first().click();
  }

  // El tablero sigue presente y el historial abre.
  await expect(page.locator('.board-area')).toBeVisible();
  await page.getByRole('button', { name: /Historial/ }).click();
  await expect(page.locator('.history-list')).toBeVisible();
  await page.screenshot({ path: 'e2e-3-historial.png' });
});

test('inspecciona una casilla y abre el mapa', async ({ page }) => {
  await iniciarPartida(page);

  // Click en la primera casilla → modal de inspección.
  await page.locator('.tile-box').first().click();
  await expect(page.locator('.inspect-head')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /Entendido/ }).click();

  // Mapa con las 28 casillas.
  await page.getByRole('button', { name: /Mapa/ }).click();
  await expect(page.locator('.map-grid .map-item')).toHaveCount(28);
  await page.getByRole('button', { name: /Cerrar/ }).click();
  await page.screenshot({ path: 'e2e-4-inspeccion.png' });
});
