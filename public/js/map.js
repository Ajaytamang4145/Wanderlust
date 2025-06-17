mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: coordinates, // starting position [lng, lat]
  zoom: 12, // starting zoom
});

// Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates) // Listings coordinates
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }) // add popups
      .setHTML(
        `<h4>${listing.title}</h4><p>Exact Location provided after booking</p>`
      )
  )
  .addTo(map);
