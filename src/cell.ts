import leaflet from "leaflet";
import { SETTINGS } from "./main.ts";

export interface Cell {
  row: number;
  col: number;
}

export function cellToLatLng(_c: Cell): leaflet.LatLng {
  return leaflet.latLng(
    SETTINGS.center.lat + _c.col * SETTINGS.TILE_DEGREES,
    SETTINGS.center.lng + _c.row * SETTINGS.TILE_DEGREES,
  );
}

export function latLngToCell(_p: leaflet.LatLng): Cell {
  return {
    row: (_p.lat - SETTINGS.center.lat) / SETTINGS.TILE_DEGREES,
    col: (_p.lng - SETTINGS.center.lng) / SETTINGS.TILE_DEGREES,
  };
}
