/**
 * LAYOUT del tablero: "El Camino del Poder" como recorrido en serpentina
 * de 7 columnas × 4 filas (28 casillas). Cada casilla tiene una posición
 * (col 0-6, row 0-3) usada por la UI para dibujar el tablero sin solaparse.
 */
export interface BoardLayoutSlot {
  col: number;
  row: number;
}

export const BOARD_LAYOUT: BoardLayoutSlot[] = (() => {
  const grid: BoardLayoutSlot[] = [];
  const cols = 7;
  const filas = 4;
  for (let row = 0; row < filas; row++) {
    if (row % 2 === 0) {
      for (let col = 0; col < cols; col++) grid.push({ col, row });
    } else {
      for (let col = cols - 1; col >= 0; col--) grid.push({ col, row });
    }
  }
  return grid; // 28 posiciones en orden de casilla 0..27
})();

export const LAYOUT_COLS = 7;
export const LAYOUT_ROWS = 4;

/** Convierte (col, row) a coordenadas porcentuales dentro del tablero. */
export function slotToPercent(slot: BoardLayoutSlot): { x: number; y: number } {
  const x = 7 + slot.col * (86 / (LAYOUT_COLS - 1));
  const y = 7 + slot.row * (86 / (LAYOUT_ROWS - 1));
  return { x, y };
}
