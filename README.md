# PERÚ: LA RUTA DEL PODER 🗳️

Juego de mesa digital de **estrategia, economía, política y sátira** ambientado en el Perú.
Controla a un personaje político inspirado en presidentes peruanos recientes, construye tu
carrera, gana las elecciones y gobierna. **Obra satírica original** (no copia de CASHFLOW,
Monopoly ni ningún otro juego).

> ⚠️ **Aviso legal de contenido:** los personajes reales aparecen como **piezas satíricas de
> juego**. Sus estadísticas son mecánicas de gameplay, no evaluaciones históricas. Ninguna
> carta afirma la culpabilidad real de ninguna persona. Las referencias históricas son
> neutrales y verificables.

---

## 🚀 En producción

- **App:** <https://peru-ruta-del-poder.pages.dev>
- **API de guardado en la nube:** `/api/saves` (Cloudflare Pages Functions + D1, serverless por uso)
- **Infraestructura:** Cloudflare Pages + Pages Functions + D1

> **Subdominio personalizado (pendiente de DNS):** `juego-de-ratas-politicas.devcarlosramos.uk`
> ya está registrado en el proyecto Pages (estado `pending`). Para activarlo, crea en el
> dashboard de Cloudflare (zona `devcarlosramos.uk`) un registro:
>
> ```
> Tipo: CNAME · Nombre: juego-de-ratas-politicas · Destino: peru-ruta-del-poder.pages.dev · Proxy: activado
> ```
>
> En cuanto exista el CNAME, Cloudflare activa el dominio automáticamente. No afecta a los
> subdominios existentes (`juego.devcarlosramos.uk`, `pelea-animales.devcarlosramos.uk`).

---

## 🧩 El juego en 30 segundos

1. Eliges un personaje (Fujimori, Toledo, García, Humala, PPK, Vizcarra, Castillo,
   Boluarte o el arquetipo ficticio "El/La Vencedor(a) 2026").
2. **ETAPA A — Carrera política:** avanzas por el tablero "El Camino del Poder"
   (28 casillas en rejilla serpentina, todas inspeccionables con zoom y mapa), acumulando
   dinero, popularidad, influencia, poder y apoyo político.
3. Las **cartas** son objetos reales: cada robo genera una decisión con costo, recompensa,
   probabilidad visible y resultado calculado al momento. Puedes **guardar cartas en tu mano**
   y jugarlas después; el mazo se agota y el descarte se rebaraja.
4. Ganas las **elecciones** y asumes la presidencia.
5. **ETAPA B — Gobierno:** resuelves "Decisiones presidenciales" durante tu mandato,
   administras tu riesgo y evitas la vacancia.
6. **Victoria:** completa tu mandato con respaldo popular, cumple tus **Objetivos de
   Poder**, o gana por puntuación al final de las rondas.

Cada turno eliges: ¿beneficio ahora y más riesgo, o juego seguro? ¿Invierto? ¿Negocio?
¿Construyo popularidad? ¿Me arriesgo? **RIESGO → RECOMPENSA → CONSECUENCIA.**

---

## 🛠️ Requisitos

- Node.js ≥ 20 y npm.
- Cuenta de Cloudflare (para el deploy de Pages/D1) y GitHub (para el repo).

## 📦 Instalación y desarrollo

```bash
npm install          # dependencias
npm run dev          # servidor de desarrollo (Vite)
npm test             # tests unitarios + integración (32 tests)
npm run test:e2e     # suite E2E completa en navegador real (Playwright + Chromium): 17 tests
npm run simulate     # 200 partidas automáticas de IA (balance)
npm run check        # TypeScript estricto
npm run build        # build de producción (dist/)
```

## ☁️ Deploy a Cloudflare Pages + D1

```bash
# 1. Crear la base de datos D1 y capturar su id
npx wrangler d1 create peru-ruta-del-poder-db
# 2. Poner el id en wrangler.jsonc (database_id)
# 3. Aplicar el esquema
npx wrangler d1 execute peru-ruta-del-poder-db --remote --file=./schema.sql
# 4. Crear el proyecto Pages (solo la primera vez)
npx wrangler pages project create peru-ruta-del-poder --production-branch main
# 5. Desplegar
npm run deploy:pages
# 6. Dominio personalizado
#    - API v4: POST /accounts/{account}/pages/projects/peru-ruta-del-poder/domains
#    - DNS: CNAME  juego-de-ratas-politicas → peru-ruta-del-poder.pages.dev (proxied)
```

> **Coste:** D1 es serverless por uso (free tier: 5M lecturas/día, 100k escrituras/día,
> 1 GB). Con guardados ocasionales de partida el uso es mínimo.

## 📁 Estructura

```
src/
  engine/          → Motor de reglas PURO (sin React), determinista y serializable
    gameEngine.ts    Orquestador del flujo por turnos
    types.ts         Modelo de datos (GameState, cartas con decisiones probabilísticas)
    constants.ts     Balance económico y de reglas
    rng.ts           RNG con semilla (reproducible)
    board.ts         Movimiento y resolución de casillas
    cards.ts         Sistema de cartas: mazo real, mano, resolución central con probabilidad
    economy.ts       Ingresos, inflación, deuda, proyectos
    election.ts      Sistema electoral (1.ª y 2.ª vuelta)
    investigation.ts Sistema de investigaciones (ficticias)
    risk.ts          Nivel de riesgo
    score.ts         Puntuación final
    ai.ts            IA con perfiles de personalidad
    turnManager.ts   Cambio de turno y rondas
    serialization.ts Serialización JSON del estado
    simulations/     Partidas automáticas y análisis de balance
  data/
    cards/           → Mazo por categoría (economy, crises, opportunities, investments,
                       events, scandals, investigations, alliances, elections, opposition,
                       projects, campaign, congress, presidential) + index.ts
    characters.ts    Personajes con estadísticas de gameplay
    board.ts         Tablero: 28 casillas inspeccionables (cartas, recompensas, riesgos)
    boardLayout.ts   Rejilla serpentina 7×4 (posiciones sin solapes)
    objectives.ts    Objetivos de Poder
    assets.ts        Activos ficticios del mercado
    projects.ts      Proyectos públicos ficticios
  ui/
    components/      GameBoard (zoom/pan/tooltip/inspección), CardModal (flip + probabilidad),
                     Hud, PlayerHand, MapModal, HistoryModal, RulesModal, InspectTileModal…
    screens/         Home, NewGame, Rules, Game (mesa), Result
    sound.ts         Sonido WebAudio sintetizado (botón 🔊)
  api/               Cliente del API D1
  hooks/             useGame (puente UI ↔ motor)
  storage/           Persistencia local (localStorage)
functions/
  api/saves.ts       → Pages Function: listar/crear guardados
  api/saves/[id].ts  → Pages Function: leer/actualizar/borrar
schema.sql           → Esquema de D1
wrangler.jsonc       → Config de Cloudflare
docs/                → Documentación del producto
```

## 📚 Documentación

| Archivo | Contenido |
| --- | --- |
| [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) | Concepto, fases, fantasía, objetivos y diseño completo |
| [docs/GAME_RULES.md](docs/GAME_RULES.md) | Reglas completas |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura, modelo de datos, motor y Cloudflare |
| [docs/CONTENT_GUIDELINES.md](docs/CONTENT_GUIDELINES.md) | Guías de contenido político responsable |
| [docs/HISTORICAL_SOURCES.md](docs/HISTORICAL_SOURCES.md) | Fuentes y contenido que requiere verificación |
| [docs/BALANCE.md](docs/BALANCE.md) | Balance, simulaciones y métricas |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Roadmap V1→V10 |

## 🧪 Calidad

- Motor 100% separado de la UI (se prueba sin interfaz).
- Partidas deterministas por semilla (misma semilla = misma partida).
- Tests unitarios e integración con Vitest (32 tests).
- **Suite E2E con Playwright** en un navegador Chromium real contra producción (17 tests):
  - **Smoke:** carga → nueva partida → tablero (28 casillas) → turno completo → inspección/mapa.
  - **Flujos:** carta probabilística con flip, mano (guardar/jugar), elecciones con campaña,
    investigación/tribunal, vacancia, victoria con desglose, guardado en la nube (D1 con
    limpieza), reglas, sonido, zoom.
  - **Fuzz:** 5 partidas IA vs IA completas verificando cero errores de consola/runtime.
  - Los tests usan estados inyectados generados con el motor real (deterministas).
- Simulador de balance con miles de partidas IA vs IA.
- TypeScript estricto, sin dependencias innecesarias.

## ⚖️ Notas legales/IP

Este proyecto es una obra original. No utiliza nombres, textos, ilustraciones, tablero ni
mecánicas específicas de CASHFLOW, Monopoly o Rich Dad. Las menciones a personas reales son
sátira política con fines informativos/culturales. Ver `docs/CONTENT_GUIDELINES.md` antes de
ampliar contenido.

---

*Hecho con determinación peruana.* 🇵🇪
