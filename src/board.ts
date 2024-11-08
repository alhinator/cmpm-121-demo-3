import leaflet from "leaflet";
import luck from "./luck.ts";
import { SETTINGS } from "./main.ts";
import { giveCoin, Player, takeCoin } from "./player.ts";
import { Cell, coinToString, createCoinArray } from "./cell.ts";

export default class Board {
  private map: leaflet.Map;
  private player: Player;
  private readonly knownCaches: Map<string, Cell>;
  constructor(_m: leaflet.Map, _p: Player) {
    this.knownCaches = new Map<string, Cell>();
    this.map = _m;
    this.player = _p;
  }

  private getCanonicalCell(_c: Cell): Cell {
    const { row, col } = _c;
    const key = [row, col].toString();

    if (!this.knownCaches.get(key)) {
      _c.coins = createCoinArray(_c);
      this.knownCaches.set(key, _c);
    }
    return this.knownCaches.get(key)!;
  }

  public getCellsNearPoint(point: leaflet.LatLng): Cell[] {
    const retVal: Cell[] = [];
    const origin = this.latLngToCell(point);
    console.log(origin);
    //this.map.panTo()
    for (let i = -SETTINGS.VISION_RANGE; i < SETTINGS.VISION_RANGE; i++) {
      for (
        let j = -SETTINGS.VISION_RANGE;
        j < SETTINGS.VISION_RANGE;
        j++
      ) {
        if (
          luck([origin.row + i, origin.col + j].toString()) <
            SETTINGS.CACHE_SPAWN_PROBABILITY
        ) {
          retVal.push(
            this.getCanonicalCell({
              row: origin.row + i,
              col: origin.col + j,
              coins: [],
            }),
          );
        }
      }
    }
    return retVal;
  }

  private drawAt(_c: Cell) {
    const bounds = this.cellToBounds(_c);
    const tmp = leaflet.rectangle(bounds);
    tmp.addTo(this.map);
    // Handle interactions with the cache
    tmp.bindPopup(() => {
      // The popup offers a description and button
      const popupDiv = document.createElement("div");
      popupDiv.innerHTML = `
                  <div>There is a cache here at "${_c.col},${_c.row}". It has value <span id="value">${_c.coins.length}</span>.</div>
                  <button id="take">Take!</button>
                  <button id="give">Give!</button>`;

      // Clicking the TAKE button decrements the cache's value and increments the player's points
      popupDiv
        .querySelector<HTMLButtonElement>("#take")!
        .addEventListener("click", () => {
          const gotten = _c.coins.pop();
          if (gotten) {
            popupDiv.querySelector<HTMLSpanElement>(
              "#value",
            )!.innerHTML = _c.coins.length.toString();
            giveCoin(this.player, gotten);
            console.log(
              "moved " +
                coinToString(gotten) +
                " to player's inventory.",
            );
          }
        });

      // Clicking the GIVE button decrements player's points & increments cache value.
      popupDiv
        .querySelector<HTMLButtonElement>("#give")!
        .addEventListener("click", () => {
          const gotten = takeCoin(this.player);
          if (gotten) {
            popupDiv.querySelector<HTMLSpanElement>(
              "#value",
            )!.innerHTML = _c.coins.length.toString();
            _c.coins.push(gotten);
            console.log(
              "moved " +
                coinToString(gotten) +
                " out of player's inventory, into cell " +
                _c,
            );
          }
        });

      return popupDiv;
    });
  }
  public drawCells(_cs: Cell[]) {
    _cs.forEach((element) => {
      this.drawAt(this.getCanonicalCell(element));
    });
  }
  latLngToCell(_p: leaflet.LatLng): Cell {
    return this.getCanonicalCell({
      row: Math.floor(
        (_p.lat - SETTINGS.center.lat) / SETTINGS.TILE_DEGREES,
      ),
      col: Math.floor(
        (_p.lng - SETTINGS.center.lng) / SETTINGS.TILE_DEGREES,
      ),
      coins: [],
    });
  }
  cellToLatLng(_c: Cell): leaflet.LatLng {
    return leaflet.latLng(
      SETTINGS.center.lng + _c.row * SETTINGS.TILE_DEGREES,
      SETTINGS.center.lat + _c.col * SETTINGS.TILE_DEGREES,
    );
  }

  cellToBounds(_c: Cell) {
    const leftUp = this.cellToLatLng(_c);
    const rightDn = this.cellToLatLng({
      col: _c.col + 1,
      row: _c.row + 1,
      coins: _c.coins,
    });
    const bounds = leaflet.latLngBounds([
      [leftUp.lat, leftUp.lng],
      [rightDn.lat, rightDn.lng],
    ]);
    return bounds;
  }
}
