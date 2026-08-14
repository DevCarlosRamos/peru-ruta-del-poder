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
2. **ETAPA A — Carrera política:** avanzas por el tablero de 28 casillas, acumulando
   dinero, popularidad, influencia, poder y apoyo político.
3. Ganas las **elecciones** y asumes la presidencia.
4. **ETAPA B — Gobierno:** resuelves "Decisiones presidenciales" durante tu mandato,
   administras tu riesgo y evitas la vacancia.
5. **Victoria:** completa tu mandato con respaldo popular, cumple tus **Objetivos de
   Poder**, o gana por puntuación al final de las rondas.

Cada turno eliges: ¿beneficio ahora y más riesgo, o juego seguro? ¿Invierto? ¿Negocio?
¿Construyo popularidad? ¿Me arriesgo?

---

## 🛠️ Requisitos

- Node.js ≥ 20 y npm.
- Cuenta de Cloudflare (para el deploy de Pages/D1) y GitHub (para el repo).

## 📦 Instalación y desarrollo

```bash
npm install          # dependencias
npm run dev          # servidor de desarrollo (Vite)
npm run test         # tests unitarios + integración (22 tests)
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
    types.ts         Modelo de datos (GameState)
    constants.ts     Balance económico y de reglas
    rng.ts           RNG con semilla (reproducible)
    board.ts         Movimiento y resolución de casillas
    cards.ts         Robo y resolución de cartas
    economy.ts       Ingresos, inflación, deuda, proyectos
    election.ts      Sistema electoral (1.ª y 2.ª vuelta)
    investigation.ts Sistema de investigaciones (ficticias)
    risk.ts          Nivel de riesgo
    score.ts         Puntuación final
    ai.ts            IA con perfiles de personalidad
    turnManager.ts   Cambio de turno y rondas
    serialization.ts Serialización JSON del estado
    simulations/     Partidas automáticas y análisis de balance
  data/            → Contenido (personajes, cartas, tablero, objetivos, activos, proyectos)
  ui/              → Interfaz React (pantallas y componentes)
  api/             → Cliente del API D1
  hooks/           → useGame (puente UI ↔ motor)
  storage/         → Persistencia local (localStorage)
functions/
  api/saves.ts     → Pages Function: listar/crear guardados
  api/saves/[id].ts→ Pages Function: leer/actualizar/borrar
schema.sql         → Esquema de D1
wrangler.jsonc     → Config de Cloudflare
docs/              → Documentación del producto
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
- Tests unitarios e integración con Vitest.
- Simulador de balance con miles de partidas IA vs IA.
- TypeScript estricto, sin dependencias innecesarias.

## ⚖️ Notas legales/IP

Este proyecto es una obra original. No utiliza nombres, textos, ilustraciones, tablero ni
mecánicas específicas de CASHFLOW, Monopoly o Rich Dad. Las menciones a personas reales son
sátira política con fines informativos/culturales. Ver `docs/CONTENT_GUIDELINES.md` antes de
ampliar contenido.

---

*Hecho con determinación peruana.* 🇵🇪
