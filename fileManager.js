const fs = require('fs');
const PATH = './db.json';

let scrittura = false;
let coda = [];

function leggiDB(callback) {
  fs.readFile(PATH, 'utf8', (err, data) => {
    if (err) return callback(err, null);
    try {
      callback(null, JSON.parse(data));
    } catch (e) {
      callback(e, null);
    }
  });
}

function processaCoda() {
  if (scrittura || coda.length === 0) return;
  scrittura = true;
  const { lettura, callback } = coda.shift();

  leggiDB((err, db) => {
    if (err) {
      scrittura = false;
      callback(err);
      processaCoda();
      return;
    }
    db.readings.push(lettura);
    if (db.readings.length > 200) db.readings.shift();
    fs.writeFile(PATH, JSON.stringify(db, null, 2), (err) => {
      scrittura = false;
      callback(err);
      processaCoda();
    });
  });
}

function scriviDB(nuovaLettura, callback) {
  coda.push({ lettura: nuovaLettura, callback });
  processaCoda();
}

module.exports = { leggiDB, scriviDB };