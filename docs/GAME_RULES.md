# GAME RULES — PERÚ: LA RUTA DEL PODER

## Materiales
- Tablero circular de 28 casillas.
- 1d6 por jugador (RNG determinista).
- Mazo de 54 cartas (12 categorías, 4 etiquetas de procedencia).
- Mercado de 12 activos ficticios, 10 proyectos ficticios, 3 alianzas ficticias.
- 24 Objetivos de Poder; 2 por jugador.

## Preparación
1. Cada jugador elige personaje (sin repetir).
2. Se barajan y reparten 2 Objetivos de Poder por jugador.
3. Orden de turno: 1d6 + influencia (mayor primero).
4. Todos comienzan en la Plaza Central (casilla 0).

## Recursos (rangos)
- Dinero (0–500), Deuda (≥0), Popularidad/Influencia/Poder/Apoyo (0–100),
  Riesgo institucional y Riesgo judicial (0–100).

## Secuencia del turno
1. **Inicio:** ingresos base + activos (+presupuesto si eres presidente, −gasto de
   palacio); inflación; avanzan proyectos/alianzas; quiebra; desbloqueo.
2. **Dado:** si eres presidente, robas una carta de Decisión presidencial en lugar de mover.
3. **Mover:** avanzas 1–6; al cruzar la Plaza Central cobras S/ 10.
4. **Casilla:** resuelves su efecto (puede crear una decisión o robar carta).
5. **Acción (1 por turno):**
   - Campaña (S/ 10 → +12 popularidad, +4 influencia).
   - Comprar activo del mercado.
   - Iniciar proyecto público.
   - Crear alianza (12 influencia → +10 apoyo).
   - Gestión riesgosa (+30 S/, +12 riesgo institucional, +8 riesgo judicial).
   - Defender tu nombre (S/ 8 → −6 riesgo judicial).
   - Pagar deuda (S/ 5 → −5 deuda).
   - Terminar turno.
6. **Check:** penalizaciones por riesgo alto; posibles investigaciones; vacancia si
   riesgo institucional ≥ 80; objetivos y victoria.
7. **Fin:** siguiente jugador. Al cerrar la ronda: intereses de deuda y −1 ronda de
   mandato presidencial.

## Elecciones
Se convocan al caer en una casilla de Elecciones o cuando no hay presidente.
1. **Campaña:** cada candidato puede gastar S/ 10 (+6 votos).
2. **Primera vuelta:** votos = popularidad·0.5 + influencia·0.2 + apoyo·0.15 + poder·0.15
   + alianzas·4 − riesgo·0.08 + 1d6.
3. **Balotaje:** los 2 primeros se enfrentan con nuevo 1d6.
4. El ganador se convierte en presidente (ficha a Palacio, mandato de 3 rondas).
   Un candidato "bloqueado por sanción" no asume (pasa el siguiente).

## Gobierno (Etapa B)
- El presidente no mueve; cada turno roba una **Decisión presidencial**.
- Mantiene mandato durante 3 rondas; puede ser vacado si su riesgo institucional ≥ 80.
- Al completar el mandato con popularidad ≥ 45 → **victoria**.
- Si completa sin respaldo → nuevas elecciones.

## Investigaciones
Estados: Rumor → Preliminar → Formal → Resolución. Avanzan en casillas de Investigación.
En el Tribunal se resuelven: puntaje = poder + influencia/2 + (defensa +15) + 5·1d6
− riesgo/2. ≥50: absolución (mecánica); si no, sanción (recursos, imagen, bloqueo).

## Cartas: mazo, mano y decisiones probabilísticas
- El **mazo** se baraja al inicio (65+ cartas) y cada casilla roba por categoría.
- Cuando el mazo se agota, el descarte vuelve a barajarse.
- Las cartas **generan decisiones reales**: cada opción puede tener costo (S/ o influencia),
  probabilidad de éxito visible (barra ████░░░░) y efectos de éxito/fallo.
- El resultado se calcula **al momento** con el RNG de la partida (nunca está predeterminado)
  y queda registrado en el historial (p. ej. "Jugador decide apostar S/ 100", "Riesgo: 30%",
  "Resultado: éxito", "Jugador obtuvo +S/ 250").
- Algunas cartas son **guardables**: puedes agregarlas a tu mano (barra inferior) y jugarlas
  cuando decidas.
- Categorías: oportunidad, inversión, crisis, elección, escándalo, investigación, alianza,
  economía, proyecto, oposición, evento nacional, evento internacional, campaña, congreso y
  decisión presidencial.

## Tablero y exploración
- 28 casillas en rejilla serpentina 7×4, todas legibles (número, icono, nombre, tipo).
- Hover → tooltip. Click → modal de inspección (efecto, recompensas, riesgos, cartas y
  decisiones disponibles). Botones de zoom +/−, centrar y ajustar; arrastrar para mover.
- Botón "🗺️ Mapa": lista completa de casillas para saltar a cualquiera.
- Botón "🔍 Inspeccionar": resalta las casillas clicables.

## Historial y reglas
- Botón "📜 Historial": crónica completa por turno.
- Botón "📖": reglas en modal (cómo jugar, recursos, cartas, riesgo, elecciones,
  investigaciones, victoria, derrota).

## Sonido
- Botón "🔊" para activar/desactivar (WebAudio sintetizado: dado, carta, éxito, fallo,
  victoria, derrota).

## Victoria
1. Mandato completo con popularidad ≥ 45.
2. Ambos Objetivos de Poder.
3. Mayor puntuación al terminar la ronda 18.

## Anti-abuso
- Techo de dinero (500) e inflación.
- Máximo 1 acción por turno.
- Intereses de deuda por ronda.
- Negociación entre jugadores: no implementada en el MVP local (ver ROADMAP V2/V3).
