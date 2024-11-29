import leaflet, { point } from "leaflet";
import { SETTINGS } from "./map.ts";
import { Coin } from "./cell.ts";
import { listener, events } from "./event.ts";
import * as Storage from "./storage.ts";

export interface Player {
  position: leaflet.LatLng;
  points: Coin[];
  marker: leaflet.Marker;
  mode: "static" | "follow";
}

export function generateNew(_map: leaflet.Map): Player {
  const tmp: Player = loadData();
  tmp.marker.bindTooltip("You!");
  tmp.marker.addTo(_map);

  assignListeners(tmp);

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

export function assignListeners(player: Player) {
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
  Storage.save("playerCoins", JSON.stringify(_p.points));
  Storage.save("playerMode", _p.mode);
  Storage.save("playerPosition", JSON.stringify(_p.position));
}
export function loadData(): Player {
  const tempPoints = Storage.load("playerCoins")
  const pts = tempPoints ? JSON.parse(tempPoints) : [];
  const tmpMode = Storage.load("playerMode");
  const mode = tmpMode ? tmpMode as "static" | "follow" : "static";

  const tmpPos = Storage.load("playerPosition");
  const pos = tmpPos ? JSON.parse(tmpPos) as leaflet.LatLng : SETTINGS.PLAYER_START;


  return {
    position: pos,
    points: pts,
    marker: leaflet.marker(pos),
    mode: mode,
  };
}
export function clearData(_p: Player) {
  Storage.remove("playerCoins");
  Storage.remove("playerMode");
  Storage.remove("playerPosition");

  _p.points = [];

  setMode(_p, "static");
  moveToPosition(_p, SETTINGS.PLAYER_START);

  listener.dispatchEvent(events.pointsChanged);
}
