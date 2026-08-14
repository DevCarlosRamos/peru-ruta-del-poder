# ARCHITECTURE — PERÚ: LA RUTA DEL PODER

## Principios
1. **Motor separado de la UI:** `src/engine` es TypeScript puro, sin React, y se prueba sin
   interfaz (`npm run simulate`, `npm test`).
2. **Estado serializable y determinista:** `GameState` es un objeto JSON puro; con la misma
   semilla se reproduce la misma partida.
3. **Contenido fuera del motor:** personajes, cartas, tablero y objetivos viven en `src/data`.
4. **Backend mínimo y serverless:** el juego funciona 100% con `localStorage`; D1 guarda
   copias opcionales en la nube (pago por uso).

## Modelo de datos (resumen)
```
GameState
 ├─ config (seed, maxRounds, playerCount, tutorial, ai)
 ├─ ronda, turnoGlobal, phase, currentPlayerId
 ├─ players[] → resources, position, assets, projects, alliances,
 │              investigations, objectives, isPresident, mandateTurns, stats
 ├─ board[] (28 TileDef), market[] (MarketEntry)
 ├─ deck/drawPile/discardPile, currentCardId
 ├─ pendingDecision (PENDING_DECISION)
 ├─ election (fase, participantes, resultados, ganador)
 ├─ economia (inflacion, mercado)
 ├─ log[] (historial) y winner
 └─ rngState (semilla consumida, para restauración exacta)
```

## Flujo de control (FASE 23)
`GameEngine.advance(state)` es una máquina de estados por `phase`. Cuando hay una
`pendingDecision` de un humano, el motor devuelve el control a la UI (modal); la UI llama
`choose(index)` o `act(actionId)` y vuelve a `advance()`.

## Módulos del motor
| Módulo | Responsabilidad |
| --- | --- |
| `gameEngine.ts` | Orquestador: fases, turnos, victoria, vacancia |
| `types.ts` | Modelo de datos |
| `constants.ts` | Balance numérico |
| `rng.ts` | RNG determinista (mulberry32) |
| `board.ts` | Movimiento y resolución de casillas |
| `cards.ts` | Robo y resolución de cartas |
| `economy.ts` | Ingresos, inflación, deuda, proyectos |
| `election.ts` | Sistema electoral |
| `investigation.ts` | Investigaciones ficticias |
| `risk.ts` | Nivel de riesgo y vacancia |
| `score.ts` | Puntuación |
| `ai.ts` | IA por perfiles |
| `turnManager.ts` | Turnos y rondas |
| `serialization.ts` | Guardar/cargar JSON |
| `simulations/` | Partidas automáticas y balance |

## Frontend
React + Vite + TypeScript. `src/hooks/useGame.ts` conecta la UI con el motor (clona el
estado, llama al motor, persiste). Pantallas: Inicio, Nueva partida, Reglas, Tablero,
Resultado. Componentes reutilizables en `src/ui/components`.

## Backend (Cloudflare)
- **Pages Functions:** `functions/api/saves.ts` y `functions/api/saves/[id].ts`
  (listar/crear/leer/actualizar/borrar guardados).
- **D1:** base `peru-ruta-del-poder-db` con tabla `saves`. Serverless por uso.
- **Config:** `wrangler.jsonc` (binding `DB`).
- Validación en el servidor: tamaño máx. de payload, campos obligatorios, tipos básicos
  (nunca se confía en el frontend).

## Seguridad (FASE 33)
En el MVP el servidor solo almacena/recupera JSON. Cuando exista backend de partidas
multijugador, **toda** la lógica de reglas debe re-ejecutarse y validarse en el servidor
(movimientos, dinero, cartas, turnos, victorias); el frontend solo envía intenciones.

## Testabilidad
`tests/engine.test.ts` y `tests/integration.test.ts` (22 tests): movimiento, dinero,
deuda, cartas, riesgo, investigaciones, elecciones, objetivos, victoria, turnos,
serialización, determinismo y partida completa IA vs IA.
