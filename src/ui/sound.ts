/**
 * Sonido del juego con WebAudio (sintetizado, sin archivos externos).
 * Botón 🔊 para activar/desactivar; preferencia persistida en localStorage.
 */

let ctx: AudioContext | null = null;
let habilitado = true;

try {
  habilitado = localStorage.getItem('peru-sonido') !== 'off';
} catch {
  habilitado = true;
}

function audio(): AudioContext | null {
  if (!habilitado) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tono(freq: number, inicio: number, duracion: number, tipo: OscillatorType = 'sine', volumen = 0.18) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = tipo;
  osc.frequency.value = freq;
  const t = a.currentTime + inicio;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volumen, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + duracion + 0.02);
}

export type SoundName = 'dado' | 'carta' | 'exito' | 'fallo' | 'victoria' | 'derrota' | 'click' | 'riesgo' | 'dinero';

export function playSound(nombre: SoundName): void {
  switch (nombre) {
    case 'click':
      tono(600, 0, 0.08, 'triangle', 0.08);
      break;
    case 'dado':
      for (let i = 0; i < 6; i++) tono(300 + Math.random() * 200, i * 0.06, 0.05, 'square', 0.05);
      tono(880, 0.45, 0.2, 'triangle', 0.15);
      break;
    case 'carta':
      tono(440, 0, 0.08, 'sine', 0.12);
      tono(660, 0.09, 0.1, 'sine', 0.12);
      tono(880, 0.19, 0.16, 'sine', 0.12);
      break;
    case 'exito':
      tono(523, 0, 0.12, 'triangle', 0.15);
      tono(659, 0.12, 0.12, 'triangle', 0.15);
      tono(784, 0.24, 0.2, 'triangle', 0.16);
      break;
    case 'fallo':
      tono(300, 0, 0.15, 'sawtooth', 0.1);
      tono(200, 0.15, 0.3, 'sawtooth', 0.12);
      break;
    case 'riesgo':
      tono(180, 0, 0.3, 'sawtooth', 0.14);
      tono(150, 0.2, 0.3, 'sawtooth', 0.1);
      break;
    case 'dinero':
      tono(880, 0, 0.07, 'triangle', 0.12);
      tono(1174, 0.07, 0.12, 'triangle', 0.12);
      break;
    case 'victoria':
      [523, 659, 784, 1046].forEach((f, i) => tono(f, i * 0.16, 0.3, 'triangle', 0.16));
      break;
    case 'derrota':
      [400, 350, 300, 220].forEach((f, i) => tono(f, i * 0.18, 0.35, 'sawtooth', 0.1));
      break;
  }
}

export function isSoundEnabled(): boolean {
  return habilitado;
}

export function toggleSound(): boolean {
  habilitado = !habilitado;
  try {
    localStorage.setItem('peru-sonido', habilitado ? 'on' : 'off');
  } catch {
    // noop
  }
  if (habilitado) playSound('click');
  return habilitado;
}
