import leaflet from "leaflet";
import luck from "./luck.ts";
import { SETTINGS } from "./map.ts";
import { giveCoin, Player, takeCoin } from "./player.ts";
import { Cell, coinArrayToString, Geocache } from "./cell.ts";
import { listener } from "./event.ts";
import * as Storage from "./storage.ts";

export default class Board {
  private map: leaflet.Map;
  private player: Player;
  private readonly visibleCaches: Map<string, Geocache>;
  private readonly savedCaches: Map<string, string>;
  private rectangles: leaflet.Rectangle[];
  private pathPoints: leaflet.LatLng[];
  private path: leaflet.Polyline;
  private popupClickEvent: Event;
  constructor(_m: leaflet.Map, _p: Player) {
    this.player = _p;
    this.map = _m;
    this.popupClickEvent = new Event("popup-clicked");

    this.visibleCaches = new Map<string, Geocache>();
    const data = this.loadData(this.player.position);
    this.savedCaches = data[0];
    this.pathPoints = data[1];
    this.path = leaflet.polyline(this.pathPoints, { color: "green" }).addTo(
      this.map,
    );

    this.rectangles = [];

    this.assignListeners();
  }
  private assignListeners() {
    listener.addEventListener("player-moved", () => {
      this.saveCaches();
      this.clearCaches();
      this.drawCaches();
      this.addPointToPath(this.player.position);
      this.drawPath();
    });

    listener.addEventListener("save-state", () => {
      this.saveCaches();
      this.saveData();
    });

    listener.addEventListener("clear-state", () => {
      this.clearData();
    });
  }
  private getCanonicalCell(_c: Cell): Geocache {
    const { row, col } = _c;
    const key = [row, col].toString();

    if (!this.visibleCaches.get(key)) {
      const mem = this.savedCaches.get(key);
      this.visibleCaches.set(key, new Geocache(row, col, mem));
    }
    return this.visibleCaches.get(key)!;
  }

  public getCachesNearPoint(point: leaflet.LatLng): Geocache[] {
    const retVal: Geocache[] = [];
    const origin = this.latLngToCell(point);
    for (let i = -SETTINGS.VISION_RANGE; i < SETTINGS.VISION_RANGE; i++) {
      for (let j = -SETTINGS.VISION_RANGE; j < SETTINGS.VISION_RANGE; j++) {
        if (
          luck([origin.row + i, origin.col + j].toString()) <
            SETTINGS.CACHE_SPAWN_PROBABILITY
        ) {
          retVal.push(
            this.getCanonicalCell({
              row: origin.row + i,
              col: origin.col + j,
            }),
          );
        }
      }
    }
    return retVal;
  }

  private drawAt(_g: Geocache) {
    const bounds = this.cellToBounds(_g.cell);
    const tmp = leaflet.rectangle(bounds);
    tmp.addTo(this.map);
    this.rectangles.push(tmp);
    // Handle interactions with the cache
    tmp.bindPopup(() => {
      // The popup offers a description and button
      const popupDiv = document.createElement("div");
      popupDiv.innerHTML = `
                  <div>There is a cache here at "${_g.cell.col},${_g.cell.row}". It has <span id="value">${_g.coins.length}</span> coins inside.</div>
                  <button id="coinToggler" verbosee="true">Show/Hide coins</button>
                  <div id="coinDisplay"></div>
                  <button id="take">Take!</button>
                  <button id="give">Give!</button>`;

      // Clicking the TAKE button decrements the cache's value and increments the player's points
      popupDiv.querySelector<HTMLButtonElement>("#take")!.addEventListener(
        "click",
        () => {
          const gotten = _g.coins.pop();
          _g.touched = true;
          if (gotten) {
            popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML = _g
              .coins.length.toString();
            giveCoin(this.player, gotten);
            popupDiv.dispatchEvent(this.popupClickEvent);
          }
        },
      );

      // Clicking the GIVE button decrements player's points & increments cache value.
      popupDiv.querySelector<HTMLButtonElement>("#give")!.addEventListener(
        "click",
        () => {
          _g.touched = true;
          const gotten = takeCoin(this.player);
          if (gotten) {
            popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML = _g
              .coins.length.toString();
            _g.coins.push(gotten);
            popupDiv.dispatchEvent(this.popupClickEvent);
          }
        },
      );

      //Clicking the Show Coins toggles visibility of the coin list.
      //clicking one of the coins brings you to its position.
      popupDiv.querySelector<HTMLButtonElement>("#coinToggler")!
        .addEventListener("click", () => {
          const button = popupDiv.querySelector<HTMLButtonElement>(
            "#coinToggler",
          )!;
          const verbosee = button.getAttribute("verbosee");
          const list = popupDiv.querySelector<HTMLDivElement>("#coinDisplay")!;

          if (verbosee == "true") {
            list.style.setProperty("display", "none");
            button.setAttribute("verbosee", "false");
          } else {
            list.style.setProperty("display", "block");
            button.setAttribute("verbosee", "true");
          }
        });

      popupDiv.addEventListener(this.popupClickEvent.type, () => {
        const list = popupDiv.querySelector<HTMLDivElement>("#coinDisplay")!;

        list.innerHTML = `<p>Contained Coins:</p>` +
          coinArrayToString(_g.coins) + `<p>--------</p>`;
        const coinClickables = list.querySelectorAll<HTMLButtonElement>(
          "#coinable",
        )!;
        coinClickables.forEach((element) => {
          element.addEventListener("click", () => {
            const r = parseInt(element.getAttribute("og_row")!);
            const c = parseInt(element.getAttribute("og_col")!);
            console.log({ r, c });
            this.map.panTo(
              this.cellToLatLng({
                row: r,
                col: c,
              }),
            );
          });
        });
      });
      popupDiv.dispatchEvent(this.popupClickEvent);
      popupDiv.querySelector<HTMLButtonElement>("#coinToggler")!.click();
      return popupDiv;
    });
  }
  public drawCaches() {
    const _gs = this.getCachesNearPoint(this.player.position);
    _gs.forEach((element) => {
      this.drawAt(element);
    });
  }
  public drawPath() {
    this.path = this.path.redraw();
  }
  public addPointToPath(_point: leaflet.LatLng) {
    this.pathPoints.push(_point);
    this.path.setLatLngs(this.pathPoints);
    this.drawPath();
  }
  latLngToCell(_p: leaflet.LatLng): Cell {
    return this.getCanonicalCell({
      row: Math.floor((_p.lat - SETTINGS.center.lat) / SETTINGS.TILE_DEGREES),
      col: Math.floor((_p.lng - SETTINGS.center.lng) / SETTINGS.TILE_DEGREES),
    }).cell;
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
    });
    const bounds = leaflet.latLngBounds([
      [leftUp.lat, leftUp.lng],
      [rightDn.lat, rightDn.lng],
    ]);
    return bounds;
  }

  saveCaches() {
    this.visibleCaches.forEach((element) => {
      //we don't need to save the state of untouched caches, as they will just regenerate deterministically.
      if (element.touched) {
        const { row, col } = element.cell;
        const key = [row, col].toString();
        this.savedCaches.set(key, element.toMemento());
      }
    });
  }
  clearCaches() {
    this.visibleCaches.clear();
    this.rectangles.forEach((rect) => {
      rect.remove();
    });
    this.rectangles = [];
  }
  clearPath() {
    this.pathPoints = [];
    this.path.setLatLngs(this.pathPoints);
  }

  loadData(
    _fallbackPos: leaflet.LatLng,
  ): [Map<string, string>, Array<leaflet.LatLng>] {
    let savedMap: Map<string, string>;
    let savedLocations: Array<leaflet.LatLng>;

    const tmpCaches = Storage.load("savedCaches");
    const tmpLocations = Storage.load("savedLocations");

    if (tmpCaches != null) {
      const caches = JSON.parse(tmpCaches);
      //array to map code edited from https://medium.com/codingbeauty-tutorials/javascript-convert-array-to-map-12907a8a334a
      savedMap = new Map<string, string>(
        caches.map((obj: string[]) => [obj[0], obj[1]]),
      );
    } else {
      savedMap = new Map<string, string>();
    }

    if (tmpLocations != null) {
      savedLocations = JSON.parse(tmpLocations);
    } else {
      savedLocations = [_fallbackPos];
    }

    return [savedMap, savedLocations];
  }
  saveData() {
    //this code taken from https://www.geeksforgeeks.org/how-to-serialize-a-map-in-javascript/
    const tmpMap = Array.from(this.savedCaches);
    const serialized = JSON.stringify(tmpMap);
    Storage.save("savedCaches", serialized);
    Storage.save("savedLocations", JSON.stringify(this.pathPoints));
  }
  clearData() {
    Storage.remove("savedCaches");
    Storage.remove("savedLocations");

    this.savedCaches.clear();
    this.visibleCaches.clear();
    this.clearCaches();
    this.drawCaches();

    this.clearPath();
    this.drawPath();
  }
}
