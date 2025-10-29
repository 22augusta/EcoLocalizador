async function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const response = await fetch(`https://api.openchargemap.io/v3/poi/?output=json&latitude=${lat}&longitude=${lon}&distance=10&distanceunit=KM`);
      const data = await response.json();

      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = "<h2>Resultados:</h2>";

      data.forEach(station => {
        const name = station.AddressInfo.Title;
        const address = station.AddressInfo.AddressLine1;
        resultsDiv.innerHTML += `<p><strong>${name}</strong><br>${address}</p>`;
      });
    });
  } else {
    alert("Geolocalização não suportada.");
  }
}
