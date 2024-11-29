// Using example imports
// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";
import * as Pl from "./player.ts";
import Board from "./board.ts";

// Style sheets
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix missing marker images
import "./leafletWorkaround.ts";
import { coinArrayToString } from "./cell.ts";

export const listener = new EventTarget();
export const saveEvent: Event = new Event("save-state");
export const clearEvent: Event = new Event("clear-state");

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

const mainMap = leaflet.map(document.getElementById("map")!, SETTINGS);
leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  .addTo(mainMap);

export const player: Pl.Player = Pl.generateNew(mainMap);

const mainBoard = new Board(mainMap, player);

const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.setAttribute("verbosee", "false");

const _movementButtons = {
  north: document.getElementById("north")!,
  south: document.getElementById("south")!,
  east: document.getElementById("east")!,
  west: document.getElementById("west")!,
};
const _controlButtons = {
  sensor: document.getElementById("sensor")!,
  reset: document.getElementById("reset")!,
  viewCoins: document.getElementById("viewCoins")!,
};

listener.addEventListener("points-changed", () => {
  statusPanel.innerText = "Current Coins: " + player.points.length;
  listener.dispatchEvent(saveEvent);
});

listener.addEventListener("player-moved", () => {
  mainMap.panTo(player.position);
  mainBoard.saveCaches();
  mainBoard.clearCaches();
  mainBoard.drawCaches();

  mainBoard.addPointToPath(player.position);
  mainBoard.drawPath();
  listener.dispatchEvent(saveEvent);
});

const moveNorth: Event = new Event("move-north");
const moveSouth: Event = new Event("move-south");
const moveEast: Event = new Event("move-east");
const moveWest: Event = new Event("move-west");
const playerMoved: Event = new Event("player-moved");
Pl.assignMovementListeners();


_movementButtons.north.addEventListener("click", () => {
  listener.dispatchEvent(moveNorth);
  listener.dispatchEvent(playerMoved);

});
_movementButtons.south.addEventListener("click", () => {
  listener.dispatchEvent(moveSouth);
  listener.dispatchEvent(playerMoved);
});
_movementButtons.east.addEventListener("click", () => {
  listener.dispatchEvent(moveEast);
  listener.dispatchEvent(playerMoved);
});
_movementButtons.west.addEventListener("click", () => {
  listener.dispatchEvent(moveWest);
  listener.dispatchEvent(playerMoved);
});

_controlButtons.sensor.addEventListener("click", () => {
  if (!(player.mode == "follow")) {
    Pl.setMode(player, "follow");
  }
});

_controlButtons.reset.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to reset all saved data? OK to reset, CANCEL to abort.",
    )
  ) {
    listener.dispatchEvent(clearEvent);
  }
});

mainMap.on("locationfound", (e) => {
  Pl.moveToPosition(player, e.latlng);
});
mainMap.on("locationerror", () => {
  alert("failed to get location.");
});

listener.addEventListener("follow-player-true", () => {
  mainMap.locate({ setView: true, watch: true });
});

listener.addEventListener("follow-player-false", () => {
  mainMap.stopLocate();
});

listener.addEventListener("save-state", () => {
  mainBoard.saveCaches();
  mainBoard.saveData();
  Pl.saveData(player);
});
listener.addEventListener("clear-state", () => {
  mainBoard.clearData();
  Pl.clearData(player);
});

_controlButtons.viewCoins.addEventListener("click", () => {
  const verbosee = statusPanel.getAttribute("verbosee");

  if (verbosee == "true") {
    listener.dispatchEvent(Pl.pointsChanged);
    statusPanel.setAttribute("verbosee", "false");
  } else {
    statusPanel.innerHTML = `<p>Owned Coins:</p>` +
      coinArrayToString(player.points) + `<p>--------</p>`;
    const coinClickables = statusPanel.querySelectorAll<HTMLButtonElement>(
      "#coinable",
    )!;
    coinClickables.forEach((element) => {
      element.addEventListener("click", () => {
        const r = parseInt(element.getAttribute("og_row")!);
        const c = parseInt(element.getAttribute("og_col")!);
        console.log({ r, c });
        mainMap.panTo(
          mainBoard.cellToLatLng({
            row: r,
            col: c,
          }),
        );
      });
    });
    statusPanel.setAttribute("verbosee", "true");
  }
});

//-------------------------------

Pl.setMode(player, player.mode);
listener.dispatchEvent(Pl.pointsChanged);
mainBoard.drawCaches();
mainBoard.drawPath();
mainMap.panTo(player.position);
