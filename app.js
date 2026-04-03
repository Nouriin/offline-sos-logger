const form = document.getElementById("sosForm");
const list = document.getElementById("list");
const statusText = document.getElementById("status");
const locationInput = document.getElementById("location");
const locBtn = document.getElementById("locBtn");

let map;
let markers = [];
let currentCoords = null;

// ✅ Initialize map
function initMap() {
  console.log("Map initializing..."); // DEBUG

  map = L.map("map", {
    center: [9.7167, 76.3200], // Kerala default 📍
    zoom: 7
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  console.log("Map initialized"); // DEBUG
}

// ✅ Online/offline status
function updateStatus() {
  statusText.textContent = navigator.onLine ? "🟢 Online" : "🔴 Offline Mode";
}

window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);
updateStatus();

// ✅ Severity styling
function getSeverityClass(severity) {
  const key = severity.trim().toLowerCase();
  return key === "high"
    ? "priority-high"
    : key === "medium"
    ? "priority-medium"
    : "priority-low";
}

// ✅ Refresh markers
function refreshMarkers(data) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  data.forEach(item => {
    if (item.lat && item.lng) {
      const marker = L.marker([item.lat, item.lng]).addTo(map);
      marker.bindPopup(
        `<strong>${item.title}</strong><br>${item.desc}<br>
        <span class="priority-chip ${getSeverityClass(item.severity)}">${item.severity}</span>`
      );
      markers.push(marker);
    }
  });
}

// ✅ Load data
function loadData() {
  list.innerHTML = "";
  const data = JSON.parse(localStorage.getItem("sos")) || [];

  if (!data.length) {
    list.innerHTML = "<li>No incidents yet</li>";
    if (map) map.setView([9.7167, 76.3200], 7);
    return;
  }

  data.forEach((item, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.title}</strong>
      <span class="priority-chip ${getSeverityClass(item.severity)}">${item.severity}</span><br>
      ${item.desc}<br>
      <small>${item.location || "Location not set"}</small><br>
      ${
        item.lat && item.lng
          ? `<small>Coordinates: ${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}</small><br>`
          : ""
      }
      <button class="delete-btn" data-index="${idx}">Delete</button>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      const saved = JSON.parse(localStorage.getItem("sos")) || [];
      saved.splice(idx, 1);
      localStorage.setItem("sos", JSON.stringify(saved));
      loadData();
    });
  });

  if (map) refreshMarkers(data);
}

// ✅ Form submit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const severity = document.getElementById("severity").value;
  const location = locationInput.value.trim();

  const newItem = { title, desc, severity, location };

  if (currentCoords) {
    newItem.lat = currentCoords.latitude;
    newItem.lng = currentCoords.longitude;
  } else if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(location)) {
    const [lat, lng] = location.split(",").map(p => parseFloat(p.trim()));
    newItem.lat = lat;
    newItem.lng = lng;
  }

  const data = JSON.parse(localStorage.getItem("sos")) || [];
  data.push(newItem);
  localStorage.setItem("sos", JSON.stringify(data));

  form.reset();
  currentCoords = null;
  loadData();

  if (newItem.lat && newItem.lng && map) {
    map.setView([newItem.lat, newItem.lng], 13);
  }
});

// ✅ Get current location
locBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }

  locBtn.textContent = "⏳ Getting location...";

  navigator.geolocation.getCurrentPosition(
    position => {
      currentCoords = position.coords;
      locationInput.value = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
      locBtn.textContent = "📍 Use current location";

      if (map) {
        map.setView(
          [position.coords.latitude, position.coords.longitude],
          13
        );
      }
    },
    () => {
      alert("Unable to get location.");
      locBtn.textContent = "📍 Use current location";
    }
  );
});

// ❌ NO SERVICE WORKER (important for now)

// ✅ FINAL FIX
document.addEventListener("DOMContentLoaded", function () {
  initMap();

  // 🔥 Double fix (important)
  setTimeout(() => {
    map.invalidateSize();
  }, 500);

  setTimeout(() => {
    map.invalidateSize();
  }, 1500);

  loadData();
});