/**
 * RNG determinista (mulberry32).
 * El motor usa siempre un RNG con semilla para que una misma partida sea reproducible.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Siguiente número flotante en [0, 1). */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Entero en [min, max] (inclusive). */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** 1d6 clásico. */
  dice(): number {
    return this.int(1, 6);
  }

  /** Devuelve true con probabilidad p (0..1). */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Devuelve el estado interno (para serialización determinista). */
  getState(): number {
    return this.state;
  }

  /** Restaura el estado interno desde una semilla ya consumida. */
  setState(s: number): void {
    this.state = s >>> 0;
  }

  /** Elige un elemento de un array. */
  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }

  /** Baraja un array (Fisher–Yates). */
  shuffle<T>(arr: readonly T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

/** Semilla numérica a partir de una cadena (hash determinista). */
export function seedFromString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
