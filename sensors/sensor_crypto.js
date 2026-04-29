const dgram = require('dgram');
const client = dgram.createSocket('udp4');

async function leggiEInvia() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur');
    const json = await res.json();

    const dati = [
      { sensor: 'bitcoin', value: json.bitcoin.eur, unit: '€' },
      { sensor: 'ethereum', value: json.ethereum.eur, unit: '€' }
    ];

    dati.forEach(d => {
      const payload = JSON.stringify({ ...d, timestamp: Date.now() });
      client.send(Buffer.from(payload), 41234, 'localhost', (err) => {
        if (err) console.error('Errore invio UDP:', err);
        else console.log('Inviato:', payload);
      });
    });
  } catch (e) {
    console.error('Errore fetch crypto:', e.message);
  }
}

leggiEInvia();
setInterval(leggiEInvia, 30000);