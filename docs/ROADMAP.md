# ROADMAP — PERÚ: LA RUTA DEL PODER

## Estado actual (MVP V0)
✅ Motor de reglas determinista separado de la UI.
✅ 9 personajes, 54 cartas, tablero de 28 casillas, 24 objetivos, economía, riesgo,
   investigaciones, elecciones, gobierno, vacancia, IA, puntuación.
✅ Guardado local + guardado en la nube (Cloudflare Pages + D1, serverless por uso).
✅ 22 tests (unidad + integración), simulador de balance, documentación.
✅ Desplegado en producción con dominio personalizado.

## V1 — Juego local (MVP actual)
Juego local humano vs IA, persistencia local y en la nube.

## V2 — IA mejorada
- IA con conciencia de objetivos y cálculo de victoria (mini-árbol de decisiones).
- Dificultades ajustables por personaje.

## V3 — Multijugador online
- Arquitectura ya preparada (GameState serializable). Backend de partidas en D1 +
  WebSockets o Durable Objects.
- Salas, matchmaking, sincronización del GameState y re-ejecución de reglas en el servidor.

## V4 — Ranking
- Tabla de puntuaciones por personaje y estrategia (D1 + índice).
- Perfiles de jugador y estadísticas históricas.

## V5 — Más personajes
- Expansión con figuras históricas previas a 1990 y arquetipos regionales ficticios,
  siguiendo CONTENT_GUIDELINES.

## V6 — Expansiones históricas
- Cartas y eventos por década (1980s, 1990s, 2000s…) con etiquetas [HISTÓRICO] verificadas.

## V7 — Aplicación móvil
- PWA o React Native reutilizando el motor (npm package del motor puro).

## V8 — Modo campaña
- Escenarios scriptados ("La hiperinflación", "La caída", "El balotaje imposible").

## V9 — Editor de cartas
- Herramienta para crear cartas con etiquetas de procedencia y validación de contenido.

## V10 — Modo competitivo
- Temporadas, ligas y balance dinámico basado en datos reales de partidas.

---
## Riesgos técnicos
- D1 es regional (ENAM): latencia fuera de la región; aceptable para guardados.
- El RNG se persiste en `rngState`; si el motor cambia su secuencia de azar, los guardados
  antiguos pueden no ser reproducibles (se versiona el estado: `state.version`).
- La IA del MVP es heurística: puede tomar decisiones subóptimas en situaciones extremas.

## Riesgos legales / IP
- Personas reales: riesgo de interpretación como acusación → mitigado con etiquetas,
  estadísticas "de gameplay" y mecánicas ficticias (ver CONTENT_GUIDELINES).
- Sátira política: revisar legislación local sobre difamación y honor antes de ampliar.
- No usar nombres, textos, tablero ni mecánicas específicas de CASHFLOW/Monopoly.
- Imágenes de políticos reales: prohibidas; solo ilustraciones originales estilizadas.
