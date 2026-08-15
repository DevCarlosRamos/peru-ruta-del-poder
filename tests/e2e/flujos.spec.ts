import { test, expect } from '@playwright/test';
import { nuevoEstado, cargarEstado, capturarErrores, erroresReales } from './helpers';

/**
 * Tests de flujos clave con estados de partida inyectados (deterministas).
 * El estado se genera con el motor real en Node y se carga en el navegador.
 */

test('carta probabilística: se muestra con flip, se decide y se resuelve', async ({ page }) => {
  const errores: string[] = [];
  capturarErrores(page, errores);
  const s = nuevoEstado(7);
  const p = s.players[0];
  s.pendingDecision = {
    id: 'carta_test',
    jugadorId: p.id,
    tipo: 'carta_decision',
    titulo: 'Cartera agresiva',
    descripcion: 'Un fondo ficticio ofrece una cartera de alto riesgo.',
    cardId: 'inv2',
    opciones: [
      { texto: 'Apostar S/ 50 (+S/100, riesgo 15%)', accion: 'carta_opcion_0', costoDinero: 50, probabilidad: 0.85 },
      { texto: 'Rechazar la propuesta', accion: 'carta_rechazar' },
    ],
  };
  await cargarEstado(page, s);

  await expect(page.locator('.card-physical')).toBeVisible();
  await expect(page.locator('.card-options .btn-option')).toHaveCount(2);
  // El volteo es una animación CSS; esperamos a que ocurra (dorso → frente).
  await page.waitForTimeout(1200);

  await page.locator('.card-options .btn-option').first().click();
  await expect(page.locator('.resolving')).toBeVisible();
  await expect(page.locator('.card-panel.resultado').first()).toBeVisible({ timeout: 12_000 });
  await page.getByRole('button', { name: /Continuar/ }).first().click();

  await expect(page.locator('.board-area')).toBeVisible();
  expect(erroresReales(errores)).toEqual([]);
});

test('mano: jugar una carta guardada desde la barra inferior', async ({ page }) => {
  const errores: string[] = [];
  capturarErrores(page, errores);
  const s = nuevoEstado(9);
  const p = s.players[0];
  p.resources.dinero = 300;
  s.hand[p.id] = ['oportunidad6'];
  await cargarEstado(page, s);

  await expect(page.locator('.hand-bar')).toBeVisible();
  await expect(page.locator('.hand-card')).toHaveCount(1);

  await page.locator('.hand-card').first().click();
  await expect(page.locator('.card-physical')).toBeVisible();
  await page.locator('.card-options .btn-option').first().click();
  await expect(page.locator('.card-panel.resultado').first()).toBeVisible({ timeout: 12_000 });
  await page.getByRole('button', { name: /Continuar/ }).first().click();
  await expect(page.locator('.board-area')).toBeVisible();
  expect(erroresReales(errores)).toEqual([]);
});

test('elecciones: invertir en campaña y ver la contienda', async ({ page }) => {
  const errores: string[] = [];
  capturarErrores(page, errores);
  const s = nuevoEstado(11);
  const j1 = s.players[0];
  const j2 = s.players[1];
  s.election = {
    fase: 'campaña',
    turno: 1,
    participantes: [j1.id, j2.id],
    resultadosPrimeraVuelta: [],
    finalistas: [],
    ganadorId: null,
    motivo: '',
    campaignIndex: 0,
    campaignChosen: {},
    campaignBonus: {},
  };
  s.pendingDecision = {
    id: 'campana_j1',
    jugadorId: j1.id,
    tipo: 'tile',
    titulo: 'Campaña electoral',
    descripcion: '¿Inviertes en tu campaña para la primera vuelta?',
    opciones: [
      { texto: 'Gastar S/ 10 en campaña (+6 votos)', accion: 'campana_si', requiereDinero: 10 },
      { texto: 'No gastar', accion: 'campana_no' },
    ],
  };
  await cargarEstado(page, s);

  await expect(page.locator('.modal-options .btn-option')).toHaveCount(2);
  await page.locator('.modal-options .btn-option').first().click();

  await expect(page.locator('.modal-overlay').first()).toBeHidden({ timeout: 12_000 });
  await expect(page.locator('.election-panel').first()).toBeVisible({ timeout: 12_000 });
  await expect(page.locator('.election-panel').first()).toContainText('Gana');
  expect(erroresReales(errores)).toEqual([]);
});

test('investigación: resolución en el tribunal', async ({ page }) => {
  const errores: string[] = [];
  capturarErrores(page, errores);
  const s = nuevoEstado(13);
  const p = s.players[0];
  p.investigations = [
    { id: 'inv_e2e', titulo: 'Caso ficticio', estado: 'investigacion_formal', origen: 'evento', turnosDeEspera: 0, tag: 'FICCION', descripcion: 'Test' },
  ];
  s.pendingDecision = {
    id: 'tribunal_e2e',
    jugadorId: p.id,
    tipo: 'investigacion_resolucion',
    titulo: 'Audiencia en el tribunal (ficticio)',
    descripcion: 'Tu investigación llega a resolución. Decide cómo defenderte.',
    opciones: [
      { texto: 'Contratar una defensa sólida (S/ 8)', accion: 'tribunal_defiende', requiereDinero: 8 },
      { texto: 'Defenderte sin recursos', accion: 'tribunal_sin' },
    ],
  };
  await cargarEstado(page, s);

  await expect(page.locator('.modal-options .btn-option')).toHaveCount(2);
  await page.locator('.modal-options .btn-option').first().click();
  await expect(page.locator('.modal-overlay').first()).toBeHidden({ timeout: 12_000 });
  await expect(page.locator('.board-area')).toBeVisible();
  expect(erroresReales(errores)).toEqual([]);
});

test('vacancia: el presidente con riesgo extremo enfrenta la moción', async ({ page }) => {
  const errores: string[] = [];
  capturarErrores(page, errores);
  const s = nuevoEstado(17);
  const p = s.players[0];
  p.isPresident = true;
  p.mandateTurns = 2;
  p.resources.riesgoInstitucional = 85;
  p.resources.influencia = 30;
  s.presidentId = p.id;
  s.pendingDecision = {
    id: 'vacancia_e2e',
    jugadorId: p.id,
    tipo: 'vacancia',
    titulo: '¡Crisis de vacancia presidencial!',
    descripcion: 'El Congreso impulsa una moción.',
    opciones: [
      { texto: 'Negociar con el Congreso (20 influencia, reduce el riesgo)', accion: 'vacancia_mitiga', requiereInfluencia: 20 },
      { texto: 'Enfrentar la moción', accion: 'vacancia_enfrentar' },
    ],
  };
  await cargarEstado(page, s);

  await expect(page.locator('.modal-options .btn-option')).toHaveCount(2);
  await page.locator('.modal-options .btn-option').first().click();
  await expect(page.locator('.modal-overlay').first()).toBeHidden({ timeout: 12_000 });
  await expect(page.locator('.board-area')).toBeVisible();
  expect(erroresReales(errores)).toEqual([]);
});

test('seguridad: una partida ya ganada no se carga como "victoria fantasma"', async ({ page }) => {
  const s = nuevoEstado(19);
  s.winner = { playerId: s.players[0].id, motivo: 'objetivos', puntos: 123 };
  s.phase = 'fin_partida';
  let alertMsg = '';
  page.on('dialog', async (d) => {
    alertMsg = d.message();
    await d.accept();
  });
  await cargarEstado(page, s);
  // El guardado terminado se descarta: no aparece la pantalla de resultado al instante.
  await page.waitForTimeout(1200);
  expect(await page.locator('.result-hero').count()).toBe(0);
  expect(alertMsg).toContain('No hay partida guardada');
});

test('guardado en la nube (D1) con limpieza posterior', async ({ page }) => {
  const s = nuevoEstado(21);
  await cargarEstado(page, s);

  let alertMsg = '';
  page.on('dialog', async (d) => {
    if (d.type() === 'prompt') {
      await d.accept('e2e-test');
    } else {
      alertMsg = d.message();
      await d.accept();
    }
  });

  await page.getByRole('button', { name: /Nube/ }).click();
  await page.waitForTimeout(5000);

  expect(alertMsg).toContain('guardada en la nube');
  // Limpiar el guardado de prueba en D1.
  const m = alertMsg.match(/id:\s*([a-z0-9-]+)/i);
  if (m) {
    const res = await fetch(`https://peru-ruta-del-poder.pages.dev/api/saves/${m[1]}`, { method: 'DELETE' });
    expect(res.status).toBe(200);
  }
});

test('reglas en modal y toggle de sonido', async ({ page }) => {
  const s = nuevoEstado(23);
  await cargarEstado(page, s);

  await page.getByRole('button', { name: '📖' }).click();
  await expect(page.locator('.accordion')).toBeVisible();
  await page.getByRole('button', { name: /Cerrar/ }).click();

  await page.getByRole('button', { name: '🔊' }).click();
  const off = await page.evaluate(() => localStorage.getItem('peru-sonido'));
  expect(off).toBe('off');
});

test('inspección, mapa y zoom sin errores', async ({ page }) => {
  const errores: string[] = [];
  capturarErrores(page, errores);
  const s = nuevoEstado(25);
  await cargarEstado(page, s);

  await page.getByRole('button', { name: '＋' }).click();
  await page.getByRole('button', { name: '−' }).click();
  await page.getByRole('button', { name: '◎' }).click();
  await page.getByRole('button', { name: '⛶' }).click();

  await page.locator('.tile-box').nth(5).click();
  await expect(page.locator('.inspect-head')).toBeVisible();
  await page.getByRole('button', { name: /Entendido/ }).click();

  await page.getByRole('button', { name: /Mapa/ }).click();
  await expect(page.locator('.map-item')).toHaveCount(28);
  await page.getByRole('button', { name: /Cerrar/ }).click();

  expect(erroresReales(errores)).toEqual([]);
});


test('el dado se puede tirar en cada turno (regresión del botón de dado)', async ({ page }) => {
  const errores: string[] = [];
  capturarErrores(page, errores);
  const s = nuevoEstado(31);
  // Asegurar que el humano (Test A) empieza la partida.
  s.players[0].orden = 1;
  s.players[1].orden = 2;
  s.currentPlayerId = s.players[0].id;
  s.phase = 'turno_inicio';
  await cargarEstado(page, s);

  // Turno 1 del humano: comenzar → tirar el dado → el número se muestra.
  await page.getByRole('button', { name: /Comenzar turno/ }).click();
  await page.getByRole('button', { name: /Tirar el dado/ }).click();
  await expect(page.locator('.dice-static .dice-face')).toBeVisible({ timeout: 8000 });

  // Resolver la carta/decisión que aparezca (si aparece).
  try {
    await page.locator('.card-options .btn-option, .modal-options .btn-option').first().waitFor({ timeout: 4000 });
    await page.locator('.card-options .btn-option, .modal-options .btn-option').first().click();
    const continuar = page.getByRole('button', { name: /Continuar/ }).first();
    await continuar.waitFor({ timeout: 10_000 });
    await continuar.click();
  } catch {
    // sin carta: seguir
  }

  // Terminar el turno del humano (puede convocar una elección).
  try {
    const terminar = page.getByRole('button', { name: /Terminar turno/ }).first();
    await terminar.waitFor({ timeout: 4000 });
    await terminar.click();
  } catch {
    // ya se terminó por otra vía
  }

  // Avanzar (modales → IA → turnos) hasta que el humano pueda actuar de nuevo.
  let intentos = 0;
  while (intentos++ < 24) {
    const tirar = page.getByRole('button', { name: /Tirar el dado/ });
    const gobernar = page.getByRole('button', { name: /Gobernar el país/ });
    if ((await tirar.count()) || (await gobernar.count())) break;

    // 1) Resolver primero cualquier modal pendiente (campaña/carta/decisión).
    const opcion = page.locator('.card-options .btn-option, .modal-options .btn-option').first();
    if (await opcion.count()) {
      await opcion.click();
      const cont = page.getByRole('button', { name: /Continuar/ }).first();
      if (await cont.count()) {
        await cont.click();
      }
      await page.waitForTimeout(250);
      continue;
    }
    // 2) Comenzar turno del humano.
    const comenzar = page.getByRole('button', { name: /Comenzar turno/ });
    if ((await comenzar.count()) && (await comenzar.isVisible())) {
      await comenzar.click();
      continue;
    }
    // 3) Avanzar la IA.
    const contIA = page.getByRole('button', { name: /Continuar \(IA\)/ });
    if ((await contIA.count()) && (await contIA.isVisible())) {
      await contIA.click();
      await page.waitForTimeout(180);
      continue;
    }
    await page.waitForTimeout(250);
  }

  // ¡El humano debe poder actuar en su segundo turno!
  const tirar = page.getByRole('button', { name: /Tirar el dado/ });
  const gobernar = page.getByRole('button', { name: /Gobernar el país/ });
  if (await tirar.count()) {
    await tirar.click();
    await expect(page.locator('.dice-static .dice-face')).toBeVisible({ timeout: 8000 });
  } else if (await gobernar.count()) {
    await gobernar.click();
    // El presidente resuelve una decisión presidencial (carta o panel).
    await expect(
      page.locator('.card-options .btn-option, .modal-options .btn-option, .actions-grid .btn').first(),
    ).toBeVisible({ timeout: 8000 });
  } else {
    throw new Error('El humano no tiene botón de turno en su segundo turno');
  }
  expect(erroresReales(errores)).toEqual([]);
});

