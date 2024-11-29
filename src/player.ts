import leaflet from "leaflet";
import { player } from "./main.ts";
import { SETTINGS } from "./map.ts";
import { Coin } from "./cell.ts";
import { listener, events } from "./event.ts";

export interface Player {
  position: leaflet.LatLng;
  points: Coin[];
  marker: leaflet.Marker;
  mode: "static" | "follow";
}

// export function getPosition(): leaflet.LatLng {
//TODO
// }



export function generateNew(_map: leaflet.Map): Player {
  const tmp: Player = loadData();
  tmp.marker.bindTooltip("You!");
  tmp.marker.addTo(_map);
  return tmp;
}

export function giveCoin(_p: Player, _coin: Coin) {
  _p.points.push(_coin);
  listener.dispatchEvent(events.pointsChanged);
}

export function takeCoin(_p: Player) {
  const retVal = _p.points.pop();
  if (retVal) {
    listener.dispatchEvent(events.pointsChanged);
  }
  return retVal;
}
export function assignListeners() {
  listener.addEventListener("move-north", () => {
    moveInDirection(player, SETTINGS.TILE_DEGREES, 0);
    setMode(player, "static");
  });

  listener.addEventListener("move-south", () => {
    moveInDirection(player, -SETTINGS.TILE_DEGREES, 0);
    setMode(player, "static");
  });

  listener.addEventListener("move-east", () => {
    moveInDirection(player, 0, SETTINGS.TILE_DEGREES);
    setMode(player, "static");
  });


  listener.addEventListener("move-west", () => {
    moveInDirection(player, 0, -SETTINGS.TILE_DEGREES);
    setMode(player, "static");
  });

  listener.addEventListener("player-follow", () => {
    if (!(player.mode == "follow")) {
      setMode(player, "follow");
    }
  })
  listener.addEventListener("player-located", (e: CustomEventInit<leaflet.LatLng>) => {
    moveToPosition(player, e.detail!);
  })
  listener.addEventListener("save-state", () => {
    saveData(player);
  });
  listener.addEventListener("clear-state", () => {
    clearData(player);
  });
}




export function moveInDirection(
  _p: Player,
  deltaLat: number,
  deltaLng: number,
) {
  _p.position = leaflet.latLng(
    _p.position.lat + deltaLat,
    _p.position.lng + deltaLng,
  );
  _p.marker.setLatLng(_p.position);
}

export function moveToPosition(_p: Player, _pos: leaflet.LatLng) {
  _p.position = _pos;
  _p.marker.setLatLng(_p.position);
}

export function setMode(_p: Player, _mode: "static" | "follow") {
  _p.mode = _mode;
  _p.mode == "follow"
    ? listener.dispatchEvent(events.followMode)
    : listener.dispatchEvent(events.staticMode);
}
export function saveData(_p: Player) {
  localStorage.setItem("playerCoins", JSON.stringify(_p.points));
  localStorage.setItem("playerMode", _p.mode);
  localStorage.setItem("playerPosition", JSON.stringify(_p.position));
}
export function loadData(): Player {
  const pts = localStorage.getItem("playerCoins")
    ? JSON.parse(localStorage.getItem("playerCoins")!)
    : [];
  const md = localStorage.getItem("playerMode") == "static" ||
    localStorage.getItem("playerMode") == "follow"
    ? (localStorage.getItem("playerMode")! as "static" | "follow")
    : "static";
  const pos = localStorage.getItem("playerPosition")
    ? (JSON.parse(
      localStorage.getItem("playerPosition")!,
    ) as leaflet.LatLng)
    : SETTINGS.PLAYER_START;
  return {
    position: pos,
    points: pts,
    marker: leaflet.marker(pos),
    mode: md,
  };
}
export function clearData(_p: Player) {
  localStorage.removeItem("playerCoins");
  localStorage.removeItem("playerMode");
  localStorage.removeItem("playerPosition");

  _p.points = [];

  setMode(_p, "static");
  moveToPosition(_p, SETTINGS.PLAYER_START);

  listener.dispatchEvent(events.pointsChanged);
}
