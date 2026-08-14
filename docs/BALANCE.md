# BALANCE — PERÚ: LA RUTA DEL PODER

## Metodología (FASE 29)
`npm run simulate [N]` ejecuta partidas 100% automáticas (IA vs IA) con semilla aleatoria y
reporta:
- Tasa de victoria por personaje.
- Motivos de fin de partida (mandato completo vs objetivos).
- Duración promedio, dinero promedio, investigaciones y presidencias por partida.
- Diagnóstico de equilibrio (rango de victorias).

## Resultados de referencia (400 partidas, 3 jugadores IA)

### Motivos de fin de partida
| Motivo | Partidas |
| --- | --- |
| mandato_completo | 363 |
| objetivos | 37 |

### Tasa de victoria por personaje
| Personaje | Tasa |
| --- | --- |
| El/La Vencedor(a) 2026 | 49.2 % |
| Dina Boluarte | 46.9 % |
| Pedro Castillo | 40.6 % |
| Martín Vizcarra | 36.4 % |
| Alejandro Toledo | 30.5 % |
| Ollanta Humala | 28.8 % |
| Alan García | 24.4 % |
| Pedro Pablo Kuczynski | 23.2 % |
| Alberto Fujimori | 21.4 % |

### Métricas globales
- Duración promedio: **4.3 rondas** (partida resuelta por mandato).
- Dinero promedio final: **S/ 78**.
- Investigaciones por partida: **0.06** (bajo: el riesgo judicial rara vez se acumula en
  partidas de IA cortas).
- Presidencias ganadas por partida: **1.01**.

## Diagnóstico y decisiones
1. **Rango de victorias 21–49 %:** aceptable para el MVP (ningún personaje dominante ni
   inviable). La diferencia se explica por popularidad inicial y sinergias con la IA.
2. **Vencedor 2026:** se le redujo el bono de habilidad (+8→+6, sin carta extra) y su
   popularidad inicial bajó de 35→32 tras la primera iteración (71 %→49 %).
3. **Fujimori/Humala:** se subió su popularidad inicial y poder; se suavizó la debilidad de
   Fujimori (−5→−3 popularidad al asumir).
4. **Castillo:** su descuento de campaña se redujo (50 %→30 %) y se implementó el costo
   reducido en las dos vías de campaña.
5. **"mandato_completo" domina (91 %).** Los Objetivos de Poder son una ruta secundaria
   viable; en el MVP es un buen balance para partidas de 30–60 minutos.

## Ajustes recomendados (próxima iteración)
- Evaluar subir la duración del mandato a 4 rondas o el umbral de popularidad a 50.
- Revisar que los jugadores humanos (con mejor planificación que la IA) no exploten la
  "gestión riesgosa" sin red.
- Rebalancear las cartas de oportunidad de alto riesgo si la tasa de investigaciones
  resulta demasiado baja en partidas largas.
- Simular con 2 y 4 jugadores para calibrar la duración.

## Economía (FASE 9): verificaciones
- **Anti dinero infinito:** techo 500 + inflación 5% sobre 250 + interés de deuda 8%.
- **Costos de campaña:** S/10 → +12 popularidad (retorno razonable).
- **Activos:** pagos 2–7 años de retorno según activo.
- **Proyectos:** beneficio ≥ 50% del costo en popularidad y dinero al completarse.
