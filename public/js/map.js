document.addEventListener("DOMContentLoaded", function () {
    if (typeof mapToken === "undefined" || !mapToken) {
        console.warn("Mapbox token is missing.");
        return;
    }

    if (typeof listing === "undefined" || !listing || !listing.geometry || !listing.geometry.coordinates) {
        console.warn("Listing geometry data is missing.");
        return;
    }

    const coordinates = listing.geometry.coordinates;

    if (!coordinates || coordinates.length !== 2) {
        console.warn("Invalid coordinates:", coordinates);
        return;
    }

    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: "map",
        center: coordinates,
        style: "mapbox://styles/mapbox/streets-v12",
        zoom: 9
    });

    // Add navigation controls (zoom in / out)
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    new mapboxgl.Marker({ color: "#fe424d" })
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<h6>${listing.title}</h6><p class="small text-muted mb-0">Exact location will be provided after booking.</p>`
            )
        )
        .addTo(map);
});