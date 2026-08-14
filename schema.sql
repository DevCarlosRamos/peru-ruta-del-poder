-- Schema de D1 para "PERÚ: LA RUTA DEL PODER"
-- Guardados de partida (serverless, pago por uso).
-- La partida se juega con localStorage; D1 solo guarda copias en la nube.

CREATE TABLE IF NOT EXISTS saves (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  ronda INTEGER NOT NULL DEFAULT 1,
  turno INTEGER NOT NULL DEFAULT 1,
  jugadores TEXT NOT NULL DEFAULT '',
  creado INTEGER NOT NULL,
  actualizado INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saves_actualizado ON saves (actualizado);

-- Validación básica de integridad (para el API).
CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO schema_meta (key, value) VALUES ('version', '1');
