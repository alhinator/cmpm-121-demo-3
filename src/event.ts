import leaflet from "leaflet";

export const listener = new EventTarget();

export const events = {
    moveNorth: new Event("move-north"),
    moveSouth: new Event("move-south"),
    moveEast: new Event("move-east"),
    moveWest: new Event("move-west"),
    playerMoved: new Event("player-moved"),
    saveEvent: new Event("save-state"),
    clearEvent: new Event("clear-state"),
    pointsChanged: new Event("points-changed"),
    followMode: new Event("follow-player-true"),
    staticMode: new Event("follow-player-false")
}

listener.addEventListener("player-moved", () => {  
    listener.dispatchEvent(events.saveEvent);
  });