// Using example imports
// @deno-types="npm:@types/leaflet@^1.9.14"
import * as PlayerController from "./player.ts";
import Board from "./board.ts";
import * as Map from "./map.ts";
import * as Control from "./site.ts"
import { listener, events } from "./event.ts";

// Style sheets
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix missing marker images
import "./leafletWorkaround.ts";

const mainMap = Map.makeMap();

export const player:PlayerController.Player = PlayerController.generateNew(mainMap);

export const mainBoard = new Board(mainMap, player);


Control.initButtons();


//-------------------------------

PlayerController.setMode(player, player.mode);
listener.dispatchEvent(events.pointsChanged);
mainBoard.drawCaches();
mainBoard.drawPath();
mainMap.panTo(player.position);
