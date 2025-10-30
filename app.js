// Simple PWA: geolocalização + câmera + POIs (Overpass) with optional serverless proxy

const locateBtn = document.getElementById('locateBtn');
const results = document.getElementById('results');
const cameraBtn = document.getElementById('cameraBtn');

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
// Registrar service worker (se suportado)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registrado:', reg.scope))
      .catch(err => console.warn('Registro do Service Worker falhou:', err));
  });
}

let map;
let markersLayer;

function initMap(lat = -15.793889, lon = -47.882778, zoom = 13) {
  if (!map) {
    map = L.map('map').setView([lat, lon], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
  } else {
    map.setView([lat, lon], zoom);
  }
}

function showStatus(msg) {
  const s = document.getElementById('status');
  if (s) s.textContent = msg;
}

// Fallback Overpass query to find charging stations around lat/lon
async function fetchOverpassStations(lat, lon, radius = 10000) {
  const query = `[out:json][timeout:25];(node["amenity"="charging_station"](around:${radius},${lat},${lon});way["amenity"="charging_station"](around:${radius},${lat},${lon});relation["amenity"="charging_station"](around:${radius},${lat},${lon}););out center;`;
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Overpass API retornou ' + resp.status);
  const json = await resp.json();
  return json.elements || [];
}

async function getLocation() {
  const locateBtn = document.getElementById('locateBtn');
  locateBtn.disabled = true;
  showStatus('Obtendo localização...');

  if (!navigator.geolocation) {
    showStatus('Geolocalização não suportada neste navegador.');
    locateBtn.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    showStatus(`Local encontrado: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    initMap(lat, lon, 13);

    // marca o usuário no mapa
    markersLayer.clearLayers();
    L.marker([lat, lon]).addTo(markersLayer).bindPopup('Você está aqui').openPopup();

    try {
      const radiusInput = parseFloat(document.getElementById('radius')?.value || 10);
      const useProxy = !!document.getElementById('useProxy')?.checked;
      showStatus(`Buscando estações próximas (raio ${radiusInput} km)...`);
      // Primeiro, tentar usar a API serverless em /api/poi (se estiver disponível)
      const distanceParam = Math.max(0.1, radiusInput);
      const url = useProxy ? `/api/poi?latitude=${lat}&longitude=${lon}&distance=${distanceParam}` : null;
      let data = null;
      try {
        if (useProxy && url) {
          const response = await fetch(url);
          if (response.ok) {
            data = await response.json();
          } else {
            throw new Error('API serverless indisponível ou retornou ' + response.status);
          }
        } else {
          throw new Error('Ignorar proxy e usar Overpass');
        }
      } catch (proxyErr) {
        console.warn('Proxy /api/poi failed, fallback to Overpass:', proxyErr);
        // Fallback: usar Overpass (sem necessidade de chave)
        data = await fetchOverpassStations(lat, lon, Math.round(distanceParam * 1000));
      }

      const resultsDiv = document.getElementById('results');
      const debugDiv = document.getElementById('debug');
      if (debugDiv) debugDiv.textContent = 'Raw response: ' + JSON.stringify(data).slice(0, 2000);
      resultsDiv.innerHTML = '<h2>Estações próximas:</h2>';

      if (!Array.isArray(data) || data.length === 0) {
        resultsDiv.innerHTML += '<p>Nenhuma estação encontrada na área.</p>';
        showStatus('Nenhuma estação encontrada.');
      } else {
        // Data pode ter formatos diferentes (OpenChargeMap vs Overpass)
        data.slice(0, 20).forEach(item => {
          let name = 'Estação';
          let latS, lonS, address = '';
          if (item.AddressInfo) {
            // OpenChargeMap format
            const info = item.AddressInfo;
            name = info.Title || name;
            address = [info.AddressLine1, info.Town, info.StateOrProvince].filter(Boolean).join(' - ');
            latS = info.Latitude;
            lonS = info.Longitude;
          } else if (item.tags || item.type) {
            // Overpass element
            const tags = item.tags || {};
            name = tags.name || tags.operator || name;
            latS = item.lat || (item.center && item.center.lat);
            lonS = item.lon || (item.center && item.center.lon);
          }

          resultsDiv.innerHTML += `<div class="station"><strong>${name}</strong><br>${address}<br>${latS && lonS ? `<a href="https://www.openstreetmap.org/?mlat=${latS}&mlon=${lonS}#map=18/${latS}/${lonS}" target="_blank" rel="noopener">Abrir no mapa</a>` : 'Localização não disponível'}</div>`;

          if (latS && lonS) {
            L.marker([latS, lonS]).addTo(markersLayer).bindPopup(`${name}`);
          }
        });
        showStatus('Resultados carregados.');
      }
    } catch (err) {
      console.error(err);
      showStatus('Erro ao buscar dados: ' + err.message);
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '<p>Erro ao consultar a API. Tente novamente mais tarde.</p>';
    } finally {
      locateBtn.disabled = false;
    }
  }, error => {
    console.warn('Geolocation error', error);
    let msg = 'Erro ao obter localização.';
    if (error.code === error.PERMISSION_DENIED) msg = 'Permissão de geolocalização negada.';
    if (error.code === error.POSITION_UNAVAILABLE) msg = 'Posição indisponível.';
    if (error.code === error.TIMEOUT) msg = 'Tempo de busca esgotado.';
    showStatus(msg);
    document.getElementById('locateBtn').disabled = false;
  }, { timeout: 10000 });
}

// ligar o botão
window.addEventListener('load', () => {
  initMap();
  const btn = document.getElementById('locateBtn');
  if (btn) btn.addEventListener('click', getLocation);
});

