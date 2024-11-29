// Using example imports
//@deno-types="npm:@types/leaflet@^1.9.14"

import { createNewPlayer } from "./player.ts";
import Board from "./board.ts";
import * as Map from "./map.ts";
import * as Control from "./site.ts"
import { listener, events } from "./event.ts";

// Style sheets
import "leaflet/dist/leaflet.css";

// Fix missing marker images
import "./leafletWorkaround.ts";

const mainMap = Map.makeMap();

export const player = createNewPlayer(mainMap);

export const mainBoard = new Board(mainMap, player);


Control.initButtons();


//-------------------------------

listener.dispatchEvent(events.pointsChanged);
mainBoard.drawCaches();
mainBoard.drawPath();
mainMap.panTo(player.position);
