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
      showStatus('Buscando estações próximas...');
      // Usar proxy serverless em /api/poi para evitar CORS no cliente
      const url = `/api/poi?latitude=${lat}&longitude=${lon}&distance=10`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha na requisição: ' + response.status);
      const data = await response.json();

      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '<h2>Estações próximas:</h2>';

      if (!Array.isArray(data) || data.length === 0) {
        resultsDiv.innerHTML += '<p>Nenhuma estação encontrada na área.</p>';
        showStatus('Nenhuma estação encontrada.');
      } else {
        data.slice(0, 20).forEach(station => {
          const info = station.AddressInfo || {};
          const name = info.Title || 'Sem nome';
          const address = [info.AddressLine1, info.Town, info.StateOrProvince].filter(Boolean).join(' - ');
          const latS = info.Latitude || station.AddressInfo?.Latitude;
          const lonS = info.Longitude || station.AddressInfo?.Longitude;

          resultsDiv.innerHTML += `<div class="station"><strong>${name}</strong><br>${address}<br><a href="https://www.openstreetmap.org/?mlat=${latS}&mlon=${lonS}#map=18/${latS}/${lonS}" target="_blank" rel="noopener">Abrir no mapa</a></div>`;

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

