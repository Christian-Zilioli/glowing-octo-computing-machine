const fs = require('fs');
const PATH = './db.json';
const MAX_READINGS = 200;   // massimo storico per sensore
const FLUSH_INTERVAL = 5000; // scrivi su disco ogni 5 secondi

// ── DB IN MEMORIA ──────────────────────────────────────────
let db = { readings: [] };
let dirty = false; // true = ci sono dati da salvare

// Carica il file all'avvio (una volta sola)
function caricaDB() {
  try {
    const raw = fs.readFileSync(PATH, 'utf8').trim();
    db = JSON.parse(raw);
    if (!Array.isArray(db.readings)) db.readings = [];
    console.log(`[DB] Caricati ${db.readings.length} record da db.json`);
  } catch (e) {
    console.warn('[DB] db.json non trovato o corrotto, parto da zero');
    db = { readings: [] };
    salvaSync(); // crea il file pulito subito
  }
}

// Scrittura sincrona (usata solo all'avvio se il file manca)
function salvaSync() {
  fs.writeFileSync(PATH, JSON.stringify(db, null, 2), 'utf8');
}

// Scrittura asincrona periodica (ogni FLUSH_INTERVAL ms)
function flush() {
  if (!dirty) return;
  const snapshot = JSON.stringify(db, null, 2);
  dirty = false;
  fs.writeFile(PATH + '.tmp', snapshot, 'utf8', (err) => {
    if (err) { console.error('[DB] Errore scrittura tmp:', err); return; }
    fs.rename(PATH + '.tmp', PATH, (err2) => {
      if (err2) console.error('[DB] Errore rename:', err2);
    });
  });
}

// ── API PUBBLICA ────────────────────────────────────────────

// Aggiunge una lettura (sincrono, solo in memoria)
function scriviDB(lettura, callback) {
  db.readings.push(lettura);
  if (db.readings.length > MAX_READINGS) db.readings.shift();
  dirty = true;
  if (callback) callback(null);
}

// Legge il DB (sincrono dalla memoria, rapidissimo)
function leggiDB(callback) {
  if (callback) callback(null, db);
  return db;
}

// ── AVVIO ───────────────────────────────────────────────────
caricaDB();
setInterval(flush, FLUSH_INTERVAL);

// Salva prima di uscire (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n[DB] Salvataggio finale...');
  salvaSync();
  process.exit(0);
});
process.on('SIGTERM', () => { salvaSync(); process.exit(0); });

module.exports = { leggiDB, scriviDB };