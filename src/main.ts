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
mainMap.panTo(SETTINGS.PLAYER_START);

const player: Pl.Player = Pl.generateNew(mainMap);
const mainBoard = new Board(mainMap, player);

const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.innerText = "Current Coins: 0";
listener.addEventListener("points-changed", () => {
  statusPanel.innerText = "Current Coins: " + player.points.length;
});

const seenCells = mainBoard.getCellsNearPoint(player.position);
mainBoard.drawCells(seenCells);
