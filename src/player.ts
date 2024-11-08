import leaflet from "leaflet";
import { listener, SETTINGS } from "./main.ts";
import { Coin } from "./cell.ts";

export interface Player {
  position: leaflet.LatLng;
  points: Coin[];
  marker: leaflet.Marker;
}

// export function getPosition(): leaflet.LatLng {
//TODO
// }

export const pointsChanged: Event = new Event("points-changed");

export function generateNew(_map: leaflet.Map): Player {
  const tmp: Player = {
    position: SETTINGS.PLAYER_START,
    points: [],
    marker: leaflet.marker(SETTINGS.PLAYER_START),
  };
  tmp.marker.bindTooltip("You!");
  tmp.marker.addTo(_map);

  return tmp;
}

export function giveCoin(_p: Player, _coin: Coin) {
  _p.points.push(_coin);
  listener.dispatchEvent(pointsChanged);
}
export function takeCoin(_p: Player) {
  const retVal = _p.points.pop();
  if (retVal) {
    listener.dispatchEvent(pointsChanged);
  }
  return retVal;
}
