import luck from "./luck.ts";
import { Memento } from "./memento.ts";

export interface Coin {
  original: Cell;
  serial: number;
}
export interface Cell {
  readonly row: number;
  readonly col: number;
}

export class Geocache implements Memento<string, Coin[]> {
  cell: Cell;
  coins: Coin[];
  touched: boolean;
  constructor(_row: number, _col: number, _mem?: string) {
    this.cell = { row: _row, col: _col };
    this.coins = _mem ? this.fromMemento(_mem) : createCoinArray(this.cell);
    this.touched = false;
  }
  toMemento(): string {
    return JSON.stringify(this.coins);
  }
  fromMemento(memento: string): Coin[] {
    return JSON.parse(memento);
  }
}

function createCoinArray(_c: Cell): Coin[] {
  const retVal: Coin[] = [];
  const pointValue = Math.floor(
    luck([_c.row, _c.col, "initialValue"].toString()) * 100,
  );
  for (let i = 0; i < pointValue; i++) {
    retVal.push({
      original: _c,
      serial: i,
    });
  }

  return retVal;
}

export function coinToString(_coin: Coin): string {
  return (
    "" +
    _coin.original.row +
    ":" +
    _coin.original.col +
    "#" +
    _coin.serial
  );
}
export function coinArrayToString(_arr: Coin[]): string {
  let retVal: string = "";

  _arr.forEach((element) => {
    retVal +=
      `<button id=coinable og_row=${element.original.row} og_col=${element.original.col}>🥇${
        coinToString(element)
      }</button>`;
  });

  return retVal;
}

export function GeocacheToDisplayString(_geo: Geocache): string {
  return (
    "" + _geo.cell.row + ":" + _geo.cell.col + "#c:" + _geo.coins.length
  );
}
