const dgram = require('dgram');
const client = dgram.createSocket('udp4');

async function leggiEInvia() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=45.46&longitude=9.19&current=temperature_2m,wind_speed_10m,relative_humidity_2m');
    const json = await res.json();
    const current = json.current;

    const dati = [
      { sensor: 'temperatura', value: current.temperature_2m, unit: '°C' },
      { sensor: 'vento', value: current.wind_speed_10m, unit: 'km/h' },
      { sensor: 'umidita', value: current.relative_humidity_2m, unit: '%' }
    ];

    dati.forEach(d => {
      const payload = JSON.stringify({ ...d, timestamp: Date.now() });
      client.send(Buffer.from(payload), 41234, 'localhost', (err) => {
        if (err) console.error('Errore invio UDP:', err);
        else console.log('Inviato:', payload);
      });
    });
  } catch (e) {
    console.error('Errore fetch meteo:', e.message);
  }
}

leggiEInvia();
setInterval(leggiEInvia, 60000);