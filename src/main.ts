// Using example imports
//@deno-types="npm:@types/leaflet@^1.9.14"

// Fix missing marker images
import "./leafletWorkaround.ts";

import Board from "./board.ts";
import * as Map from "./map.ts";
import * as Control from "./site.ts";
import { events, listener } from "./event.ts";
import { createNew, Player } from "./player.ts";

// Style sheets
import "leaflet/dist/leaflet.css";
import "./style.css";

const mainMap = Map.makeMap();

export const player: Player = createNew(mainMap);

export const mainBoard = new Board(mainMap, player);

Control.initButtons();

//-------------------------------

listener.dispatchEvent(events.pointsChanged);
mainBoard.drawCaches();
mainBoard.drawPath();
mainMap.panTo(player.position);
