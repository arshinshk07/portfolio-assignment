// Initialize variables
let map;
let markers = [];
let userMarker = null; // will store the user's location marker
let destSelect;
let geocoder;
let directionsService;
let directionsRenderer;

// 11 Hamilton locations
const initialPlaces = [
  { id: 1, name: "Bayfront Park", category: "park", desc: "Scenic waterfront park.", lat: 43.2661, lng: -79.8712 },
  { id: 2, name: "Royal Botanical Gardens", category: "park", desc: "Beautiful botanical gardens.", lat: 43.2668, lng: -79.8889 },
  { id: 3, name: "Art Gallery of Hamilton", category: "museum", desc: "Local and international art.", lat: 43.26, lng: -79.876 },
  { id: 4, name: "Canadian Warplane Heritage Museum", category: "museum", desc: "Historic aircraft exhibits.", lat: 43.167, lng: -79.9341 },
  { id: 5, name: "Jackson Square Mall", category: "other", desc: "Shopping and dining.", lat: 43.2562, lng: -79.869 },
  { id: 6, name: "Dundurn Castle", category: "museum", desc: "Historic mansion and gardens.", lat: 43.2487, lng: -79.8881 },
  { id: 7, name: "Chedoke Falls", category: "park", desc: "Small hidden waterfall.", lat: 43.241, lng: -79.918 },
  { id: 8, name: "Hamilton Farmers Market", category: "other", desc: "Fresh produce and local goods.", lat: 43.2609, lng: -79.8677 },
  { id: 9, name: "Princess Point", category: "park", desc: "Popular picnic spot.", lat: 43.2125, lng: -79.8983 },
  { id: 10, name: "Canadian Football Hall of Fame", category: "museum", desc: "Celebrate Canadian football.", lat: 43.2647, lng: -79.87 },
  { id: 11, name: "Earth to Table: Bread Bar", category: "restaurant", desc: "Casual dining with pizza and local dishes.", lat: 43.2575, lng: -79.8715 }
];

function initMap() {
  // Initialize map
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 43.2557, lng: -79.8711 },
    zoom: 12,
  });

  // Initialize global services and elements
  destSelect = document.getElementById("destSelect");
  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map });

  // Load initial places
  initialPlaces.forEach(place => addMarkerToMap(place));

  // Populate dropdown
  updateDestinations();

  // Locate Me button
  document.getElementById("locateBtn").addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          placeUserMarker(pos);
        },
        (error) => alert("Error getting location: " + error.message),
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  });

  // Add Place form
  document.getElementById("addForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const address = document.getElementById("address").value;
    const name = document.getElementById("name").value;
    const desc = document.getElementById("desc").value;
    const category = document.getElementById("category").value;

    if (!address || !name || !desc) {
      alert("Please fill in all fields.");
      return;
    }

    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const newPlace = {
          id: Date.now(),
          name,
          desc,
          category,
          lat: location.lat(),
          lng: location.lng(),
        };
        addMarkerToMap(newPlace);
        updateDestinations();
        document.getElementById("addForm").reset();
        map.setCenter(location);
        map.setZoom(14);
      } else {
        alert("Geocode failed: " + status);
      }
    });
  });

  // Get Directions button
  document.getElementById("getDirBtn").addEventListener("click", () => {
    if (!userMarker) {
      alert("Please set your location first!");
      return;
    }

    const destId = destSelect.value;
    if (!destId) {
      alert("Please select a destination.");
      return;
    }

    const destinationMarker = markers.find(m => m.metadata.id == destId);
    if (!destinationMarker) return;

    const request = {
      origin: userMarker.getPosition(),
      destination: destinationMarker.marker.getPosition(),
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
      } else {
        alert("Directions request failed: " + status);
      }
    });
  });
}

// Update destination dropdown
function updateDestinations() {
  destSelect.innerHTML = '<option value="">Select a destination</option>';
  markers.forEach(obj => {
    const option = document.createElement("option");
    option.value = obj.metadata.id;
    option.text = obj.metadata.name;
    destSelect.appendChild(option);
  });
}

// Add marker to map
function addMarkerToMap(place) {
  const marker = new google.maps.Marker({
    position: { lat: place.lat, lng: place.lng },
    map,
    title: place.name,
  });

  const infowindow = new google.maps.InfoWindow({
    content: `<div><strong>${place.name}</strong><br>${place.desc}<br><br>
              <button onclick="showDirections(${place.lat}, ${place.lng})">Get Directions</button></div>`
  });

  marker.addListener("click", () => infowindow.open(map, marker));
  markers.push({ marker, metadata: place });
}

// User marker
function placeUserMarker(position) {
  if (userMarker) userMarker.setMap(null);
  userMarker = new google.maps.Marker({
    position,
    map,
    title: "Your Location",
    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  });
  map.setCenter(position);
  map.setZoom(14);
}

// Filter markers
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const category = btn.getAttribute("data-cat");
    setFilter(category);
  });
});

function setFilter(category) {
  markers.forEach(obj => {
    if (category === "all" || obj.metadata.category === category) {
      obj.marker.setMap(map);
    } else {
      obj.marker.setMap(null);
    }
  });
}

// Directions from info window button
function showDirections(lat, lng) {
  if (!userMarker) {
    alert("Please set your location first!");
    return;
  }
  const request = {
    origin: userMarker.getPosition(),
    destination: { lat, lng },
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);
    } else {
      alert("Directions request failed: " + status);
    }
  });
}


window.initMap = initMap;
