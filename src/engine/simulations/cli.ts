import { runSimulations, analyzeBalance } from './simulate';

/**
 * CLI de simulación: `npm run simulate [N]`
 * Ejecuta N partidas automáticas de IA y reporta métricas de balance.
 */
const N = Number(process.argv[2] ?? 200);
console.log(`Simulando ${N} partidas automáticas (IA vs IA)...`);

const results = runSimulations(N);

const motivos: Record<string, number> = {};
for (const r of results) {
  motivos[r.motivo] = (motivos[r.motivo] ?? 0) + 1;
}
console.log('\n=== Motivos de fin de partida ===');
console.table(motivos);

const balance = analyzeBalance(results);
console.log('\n=== Balance por personaje (tasa de victoria) ===');
console.table(balance);

const promedioRondas = results.reduce((a, r) => a + r.rondas, 0) / Math.max(1, results.length);
const promDinero = results.reduce((a, r) => a + r.dineroPromedio, 0) / Math.max(1, results.length);
const totalInvestigaciones = results.reduce((a, r) => a + r.investigacionesTotales, 0);
const totalElecciones = results.reduce((a, r) => a + r.eleccionesTotales, 0);
console.log('\n=== Métricas globales ===');
console.log(`Duración promedio: ${promedioRondas.toFixed(1)} rondas`);
console.log(`Dinero promedio al final: S/ ${promDinero.toFixed(0)}`);
console.log(`Investigaciones por partida: ${(totalInvestigaciones / Math.max(1, results.length)).toFixed(2)}`);
console.log(`Presidencias ganadas (elecciones) por partida: ${(totalElecciones / Math.max(1, results.length)).toFixed(2)}`);

// Verificación simple de equilibrio.
const tasas = balance.map((b) => b.tasaVictorias);
const max = Math.max(...tasas);
const min = Math.min(...tasas);
console.log('\n=== Diagnóstico de balance ===');
if (max - min > 30) {
  console.log(`⚠️  Diferencia de victorias amplia (${min}% - ${max}%). Personajes a revisar.`);
} else {
  console.log(`✔  Rango razonable de victorias (${min}% - ${max}%).`);
}
