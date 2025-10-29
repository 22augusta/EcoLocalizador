// Vercel Serverless Function: proxy para Open Charge Map
// Endpoint: /api/poi?latitude=..&longitude=..&distance=10

export default async function handler(req, res) {
    const { latitude, longitude, distance = 10 } = req.query;

    if (!latitude || !longitude) {
        res.status(400).json({ error: 'Parâmetros latitude e longitude são obrigatórios' });
        return;
    }

    try {
        const apiUrl = `https://api.openchargemap.io/v3/poi/?output=json&latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&distance=${encodeURIComponent(distance)}&distanceunit=KM`;

        // Usar fetch global (Node 18+ / Vercel suporta)
        const apiRes = await fetch(apiUrl);
        const data = await apiRes.json();

        // Permitir CORS para clientes
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.status(apiRes.ok ? 200 : 502).json(data);
    } catch (err) {
        console.error('Proxy error', err);
        res.status(500).json({ error: 'Erro no servidor ao consultar Open Charge Map' });
    }
}
