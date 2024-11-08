import luck from "./luck.ts";

export interface Coin {
  original: Cell;
  serial: number;
}
export interface Cell {
  readonly row: number;
  readonly col: number;
  coins: Coin[];
}
export function createCoinArray(_c: Cell): Coin[] {
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
export function cellToString(_cell: Cell): string {
  return "" + _cell.row + ":" + _cell.col + "#c:" + _cell.coins.length;
}
