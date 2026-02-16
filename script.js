// Rwanda map bounds (southwest, northeast)
const rwandaBounds = [
  [-2.839, 28.861], // SW corner
  [-1.047, 30.895]  // NE corner
];

// Initialize the map centered on Rwanda
const map = L.map('map', {
  maxBounds: rwandaBounds,
  maxBoundsViscosity: 0.8
}).setView([-1.9403, 29.8739], 8); // Kigali approx center

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

let userMarker;
let destMarker;
let routeLine;

// Function to get user location (restricted to Rwanda)
function locateUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Check if inside Rwanda bounds
        if (
          lat < rwandaBounds[0][0] || lat > rwandaBounds[1][0] ||
          lng < rwandaBounds[0][1] || lng > rwandaBounds[1][1]
        ) {
          alert("Your location is outside Rwanda. Map will still center in Rwanda.");
          map.setView([-1.9403, 29.8739], 8);
          return;
        }

        map.setView([lat, lng], 12);

        if (userMarker) userMarker.remove();
        userMarker = L.marker([lat, lng]).addTo(map)
          .bindPopup("You are here").openPopup();
      },
      () => {
        document.getElementById('status').innerText =
          "Could not get your location.";
      }
    );
  } else {
    document.getElementById('status').innerText =
      "Geolocation is not supported by your browser.";
  }
}

locateUser();

// Function to get destination coordinates (Rwanda only)
async function getCoordinates(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=rw&q=${place}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } else {
    return null;
  }
}

// Handle form submit
document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dest = document.getElementById('destination').value;
  document.getElementById('status').innerText = "Searching...";

  const coords = await getCoordinates(dest);
  if (!coords) {
    document.getElementById('status').innerText =
      "Destination not found in Rwanda.";
    return;
  }

  document.getElementById('status').innerText = "";

  // Add destination marker
  if (destMarker) destMarker.remove();
  destMarker = L.marker(coords).addTo(map)
    .bindPopup(dest).openPopup();

  // Draw route (straight line from user if exists)
  if (userMarker) {
    const userCoords = userMarker.getLatLng();
    if (routeLine) routeLine.remove();
    routeLine = L.polyline([userCoords, coords], { color: 'green' }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
  } else {
    map.setView(coords, 12);
  }
});

function findLocation(place) {
  alert("Finding directions to " + place);
  // Later we can connect this to Leaflet map routing
}





