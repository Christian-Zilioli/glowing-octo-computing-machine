const dgram = require('dgram');
const express = require('express');
const { leggiDB, scriviDB } = require('./fileManager');

const app = express();
const udpServer = dgram.createSocket('udp4');

app.use(express.static('public'));

app.get('/api/data', (req, res) => {
  leggiDB((err, db) => {
    if (err) return res.status(500).json({ error: 'Errore lettura DB' });
    const ultimi = {};
    db.readings.forEach(r => { ultimi[r.sensor] = r; });
    res.json(ultimi);
  });
});

app.get('/api/history', (req, res) => {
  leggiDB((err, db) => {
    if (err) return res.status(500).json({ error: 'Errore lettura DB' });
    res.json(db.readings);
  });
});

udpServer.on('message', (msg) => {
  try {
    const lettura = JSON.parse(msg.toString());
    console.log('Ricevuto:', lettura);
    scriviDB(lettura, (err) => {
      if (err) console.error('Errore scrittura DB:', err);
    });
  } catch (e) {
    console.error('Messaggio UDP non valido:', e.message);
  }
});

udpServer.bind(41234, () => {
  console.log('Server UDP in ascolto sulla porta 41234');
});

app.listen(3000, () => {
  console.log('Server Express attivo su http://localhost:3000');
});