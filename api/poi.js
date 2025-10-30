// Vercel Serverless function: proxy para Overpass (OpenStreetMap)
// Aceita query params: latitude, longitude, distance (km, opcional, padrão 10)

module.exports = async (req, res) => {
  try {
    const q = req.query || {};
    const latitude = parseFloat(q.latitude || q.lat || req.body?.latitude);
    const longitude = parseFloat(q.longitude || q.lon || req.body?.longitude);
    const distanceKm = parseFloat(q.distance || q.d || 10);

    if (!isFinite(latitude) || !isFinite(longitude)) {
      res.status(400).json({ error: 'Parâmetros latitude e longitude são obrigatórios e devem ser numéricos.' });
      return;
    }

    const radius = Math.max(100, Math.min(50000, Math.round(distanceKm * 1000)));

    const query = `[out:json][timeout:25];(node["amenity"="charging_station"](around:${radius},${latitude},${longitude});way["amenity"="charging_station"](around:${radius},${latitude},${longitude});relation["amenity"="charging_station"](around:${radius},${latitude},${longitude}););out center;`;
    const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

    const upstream = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      res.status(502).json({ error: 'Overpass returned ' + upstream.status, details: text });
      return;
    }
    const json = await upstream.json().catch(() => null);
    const elements = (json && json.elements) ? json.elements : [];

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(elements);
  } catch (err) {
    console.error('api/poi error', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: err.message || String(err) });
  }
};
