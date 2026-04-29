const dgram = require('dgram');
const client = dgram.createSocket('udp4');

async function leggiEInvia() {
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson');
    const json = await res.json();

    if (json.features.length === 0) return;

    const ultimo = json.features[0].properties;
    const payload = JSON.stringify({
      sensor: 'sismica',
      value: ultimo.mag,
      unit: 'magnitudo',
      luogo: ultimo.place,
      timestamp: Date.now()
    });

    client.send(Buffer.from(payload), 41234, 'localhost', (err) => {
      if (err) console.error('Errore invio UDP:', err);
      else console.log('Inviato:', payload);
    });
  } catch (e) {
    console.error('Errore fetch sismica:', e.message);
  }
}

leggiEInvia();
setInterval(leggiEInvia, 300000);