import leaflet from "leaflet";
import { events, listener } from "./event";
import { player } from "./main";
//Tunable params - all caps names are NOT required by leaflet conventions
export const SETTINGS = {
    center: leaflet.latLng(0, 0),
    zoom: 18,
    minZoom: 17,
    maxZoom: 19,
    zoomControl: false,
    scrollWheelZoom: true,
    TILE_DEGREES: 1e-4,
    VISION_RANGE: 8,
    CACHE_SPAWN_PROBABILITY: 0.1,
    PLAYER_START: leaflet.latLng(36.98949379578401, -122.06277128548504),
};


export function makeMap(): leaflet.Map {
    const mainMap =
        leaflet.map(document.getElementById("map")!, SETTINGS);
    leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
                '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(mainMap);


    listener.addEventListener("player-moved", () => {
        mainMap.panTo(player.position);

        listener.dispatchEvent(events.saveEvent);
    });

    mainMap.on("locationfound", (e) => {
        const playerLocated = new CustomEvent("player-located", { 'detail': e.latlng })
        listener.dispatchEvent(playerLocated)
    });
    mainMap.on("locationerror", () => {
        alert("failed to get location.");
    });

    listener.addEventListener("map-panto", (e: CustomEventInit) => {
        mainMap.panTo(e.detail!);
    })

    listener.addEventListener("follow-player-true", () => {
        mainMap.locate({ setView: true, watch: true });
    });

    listener.addEventListener("follow-player-false", () => {
        mainMap.stopLocate();
    });

    return mainMap;
}

