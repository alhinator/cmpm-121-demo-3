import leaflet from "leaflet";
import { listener, SETTINGS } from "./main.ts";

export interface Player {
  position: leaflet.LatLng;
  points: number;
  marker: leaflet.Marker;
}

// export function getPosition(): leaflet.LatLng {
//TODO
// }

export const pointsChanged: Event = new Event("points-changed");

export function generateNew(_map: leaflet.Map): Player {
  const tmp: Player = {
    position: SETTINGS.center,
    points: 0,
    marker: leaflet.marker(SETTINGS.center),
  };
  tmp.marker.bindTooltip("You!");
  tmp.marker.addTo(_map);

  return tmp;
}

export function incrementPoints(_p: Player, amount: number) {
  _p.points += amount;
  listener.dispatchEvent(pointsChanged);
}
