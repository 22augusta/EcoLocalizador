// Simple PWA: geolocalização + câmera + Wikipedia GeoSearch

// Service Worker register
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/simple-pwa/service-worker.js').catch(console.warn);
}

const locateBtn = document.getElementById('locateBtn');
const results = document.getElementById('results');
const cameraBtn = document.getElementById('cameraBtn');

locateBtn.addEventListener('click', async () => {
    results.innerHTML = 'Obtendo localização...';
    if (!navigator.geolocation) {
        results.innerHTML = '<p>Geolocalização não suportada.</p>';
        return;
    }
    navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        results.innerHTML = `<h2>Local: ${lat.toFixed(5)}, ${lon.toFixed(5)}</h2><p>Buscando artigos próximos...</p>`;

        try {
            // Overpass API query: buscar estações de carregamento (amenity=charging_station)
            const radius = 10000; // metros
            const query = `[out:json][timeout:25];(node["amenity"="charging_station"](around:${radius},${lat},${lon});way["amenity"="charging_station"](around:${radius},${lat},${lon});relation["amenity"="charging_station"](around:${radius},${lat},${lon}););out center;`;
            const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Overpass API retornou ' + resp.status);
            const json = await resp.json();
            const items = json.elements || [];
            if (items.length === 0) {
                results.innerHTML += '<p>Nenhuma estação de carregamento encontrada na área.</p>';
                return;
            }
            const list = document.createElement('div');
            items.slice(0, 50).forEach(it => {
                const tags = it.tags || {};
                const name = tags.name || tags.operator || 'Estação de carregamento';
                // obter coordenadas: node tem lat/lon, way/relation têm center
                const latS = it.lat || (it.center && it.center.lat);
                const lonS = it.lon || (it.center && it.center.lon);
                const dist = it.tags && it.tags['distance'] ? it.tags['distance'] : '';
                const el = document.createElement('div');
                el.className = 'item';
                el.innerHTML = `<strong>${name}</strong><br>${tags.street || ''} ${tags.city || ''}<br>${latS && lonS ? 'Localização disponível' : 'Sem localização exata'}<br><a href="https://www.openstreetmap.org/?mlat=${latS}&mlon=${lonS}#map=18/${latS}/${lonS}" target="_blank">Abrir no OSM</a>`;
                list.appendChild(el);
                if (latS && lonS) {
                    const marker = document.createElement('div');
                }
            });
            results.appendChild(list);
        } catch (err) {
            results.innerHTML += '<p>Erro ao consultar Overpass API.</p>';
            console.error(err);
        }
    }, err => {
        results.innerHTML = `<p>Erro de geolocalização: ${err.message}</p>`;
    }, { timeout: 10000 });
});

// Camera
const cameraSection = document.getElementById('cameraSection');
const video = document.getElementById('video');
const snapBtn = document.getElementById('snapBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const canvas = document.getElementById('canvas');
const photoPreview = document.getElementById('photoPreview');
let stream;

cameraBtn.addEventListener('click', async () => {
    cameraSection.hidden = false;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        video.srcObject = stream;
    } catch (err) {
        cameraSection.hidden = true;
        alert('Não foi possível acessar a câmera: ' + err.message);
    }
});

snapBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    photoPreview.src = dataURL;
    photoPreview.hidden = false;
});

closeCameraBtn.addEventListener('click', () => {
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
    }
    cameraSection.hidden = true;
});
