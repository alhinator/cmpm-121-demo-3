import leaflet from "leaflet";
import luck from "./luck.ts";
import { SETTINGS } from "./main.ts";
import * as C from "./cell.ts";
import { incrementPoints, Player } from "./player.ts";

const activeCaches: leaflet.Rectangle[] = [];

export function displayLocal(
  radius: number,
  center: C.Cell,
  _m: leaflet.Map,
  _p: Player,
) {
  for (let i = -radius; i < radius; i++) {
    for (let j = -radius; j < radius; j++) {
      if (
        luck([center.row + i, center.col + j].toString()) <
          SETTINGS.CACHE_SPAWN_PROBABILITY
      ) {
        spawnAt({ row: center.row + i, col: center.col + j }, _m, _p);
      }
    }
  }
}

export function spawnAt(_c: C.Cell, _m: leaflet.Map, _p: Player) {
  const leftUp = C.cellToLatLng(_c);
  const rightDn = C.cellToLatLng({ col: _c.col + 1, row: _c.row + 1 });
  const bounds = leaflet.latLngBounds([
    [leftUp.lat, leftUp.lng],
    [rightDn.lat, rightDn.lng],
  ]);
  const tmp = leaflet.rectangle(bounds);
  activeCaches.push(tmp);
  tmp.addTo(_m);
  // Handle interactions with the cache
  tmp.bindPopup(() => {
    // Each cache has a random point value, mutable by the player
    let pointValue = Math.floor(
      luck([_c.row, _c.col, "initialValue"].toString()) * 100,
    );

    // The popup offers a description and button
    const popupDiv = document.createElement("div");
    popupDiv.innerHTML = `
                <div>There is a cache here at "${_c.col},${_c.row}". It has value <span id="value">${pointValue}</span>.</div>
                <button id="take">Take!</button>
                <button id="give">Give!</button>`;

    // Clicking the TAKE button decrements the cache's value and increments the player's points
    popupDiv
      .querySelector<HTMLButtonElement>("#take")!
      .addEventListener("click", () => {
        if (pointValue <= 0) return;
        pointValue--;
        popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML =
          pointValue.toString();
        incrementPoints(_p, 1);
      });

    // Clicking the GIVE button decrements player's points & increments cache value.
    popupDiv
      .querySelector<HTMLButtonElement>("#give")!
      .addEventListener("click", () => {
        if (_p.points <= 0) return;
        pointValue++;
        popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML =
          pointValue.toString();
        incrementPoints(_p, -1);
      });

    return popupDiv;
  });
}
