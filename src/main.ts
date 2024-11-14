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

const player: Pl.Player = Pl.generateNew(mainMap);

const mainBoard = new Board(mainMap, player);

const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.innerText = "Current Coins: 0";
listener.addEventListener("points-changed", () => {
  statusPanel.innerText = "Current Coins: " + player.points.length;
  listener.dispatchEvent(saveEvent);
});

const _movementButtons = {
  north: document.getElementById("north")!,
  south: document.getElementById("south")!,
  east: document.getElementById("east")!,
  west: document.getElementById("west")!,
};
const _controlButtons = {
  sensor: document.getElementById("sensor")!,
  reset: document.getElementById("reset")!,
};

listener.addEventListener("player-moved", () => {
  mainMap.panTo(player.position);
  mainBoard.saveCaches();
  mainBoard.clearCaches();
  mainBoard.drawCaches();

  mainBoard.addPointToPath(player.position);
  mainBoard.drawPath();
  listener.dispatchEvent(saveEvent);
});

_movementButtons.north.addEventListener("click", () => {
  Pl.moveInDirection(player, SETTINGS.TILE_DEGREES, 0);
  Pl.setMode(player, "static");
});
_movementButtons.south.addEventListener("click", () => {
  Pl.moveInDirection(player, -SETTINGS.TILE_DEGREES, 0);
  Pl.setMode(player, "static");
});
_movementButtons.east.addEventListener("click", () => {
  Pl.moveInDirection(player, 0, SETTINGS.TILE_DEGREES);
  Pl.setMode(player, "static");
});
_movementButtons.west.addEventListener("click", () => {
  Pl.moveInDirection(player, 0, -SETTINGS.TILE_DEGREES);
  Pl.setMode(player, "static");
});

_controlButtons.sensor.addEventListener(
  "click",
  () => Pl.setMode(player, "follow"),
);
_controlButtons.reset.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to reset all saved data? OK to reset, CANCEL to abort.",
    )
  ) {
    listener.dispatchEvent(clearEvent);
  }
});

listener.addEventListener("follow-player-true", () => {
  mainMap.locate({ setView: true }).on("locationfound", (e) => {
    Pl.moveToPosition(player, e.latlng);
  });
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

//-------------------------------
Pl.setMode(player, player.mode);
listener.dispatchEvent(Pl.pointsChanged);
mainBoard.drawCaches();
mainBoard.drawPath();
mainMap.panTo(player.position);
