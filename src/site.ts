
import { listener, events } from "./event.ts";
import { coinArrayToString } from "./cell.ts";
import { player, mainBoard } from "./main.ts";

const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.setAttribute("verbosee", "false");
listener.addEventListener("points-changed", () => {
    statusPanel.innerText = "Current Coins: " + player.points.length;
    listener.dispatchEvent(events.saveEvent);
});

export const _movementButtons = {
    north: document.getElementById("north")!,
    south: document.getElementById("south")!,
    east: document.getElementById("east")!,
    west: document.getElementById("west")!,
};
export const _controlButtons = {
    sensor: document.getElementById("sensor")!,
    reset: document.getElementById("reset")!,
    viewCoins: document.getElementById("viewCoins")!,
};

export function initButtons() {
    _movementButtons.north.addEventListener("click", () => {
        listener.dispatchEvent(events.moveNorth);
        listener.dispatchEvent(events.playerMoved);

    });
    _movementButtons.south.addEventListener("click", () => {
        listener.dispatchEvent(events.moveSouth);
        listener.dispatchEvent(events.playerMoved);
    });
    _movementButtons.east.addEventListener("click", () => {
        listener.dispatchEvent(events.moveEast);
        listener.dispatchEvent(events.playerMoved);
    });
    _movementButtons.west.addEventListener("click", () => {
        listener.dispatchEvent(events.moveWest);
        listener.dispatchEvent(events.playerMoved);
    });

    _controlButtons.sensor.addEventListener("click", () => {
        listener.dispatchEvent(events.followMode)
    });

    _controlButtons.reset.addEventListener("click", () => {
        if (
            confirm(
                "Are you sure you want to reset all saved data? OK to reset, CANCEL to abort.",
            )
        ) {
            listener.dispatchEvent(events.clearEvent);
        }
    });

    _controlButtons.viewCoins.addEventListener("click", () => {
        const verbosee = statusPanel.getAttribute("verbosee");

        if (verbosee == "true") {
            listener.dispatchEvent(events.pointsChanged);
            statusPanel.setAttribute("verbosee", "false");
        } else {
            statusPanel.innerHTML = `<p>Owned Coins:</p>` +
                coinArrayToString(player.points) + `<p>--------</p>`;
            const coinClickables = statusPanel.querySelectorAll<HTMLButtonElement>(
                "#coinable",
            )!;
            coinClickables.forEach((element) => {
                element.addEventListener("click", () => {
                    const r = parseInt(element.getAttribute("og_row")!);
                    const c = parseInt(element.getAttribute("og_col")!);
                    const mapPan = new CustomEvent("map-panto", {
                        'detail': mainBoard.cellToLatLng({ row: r, col: c })
                    });
                    listener.dispatchEvent(mapPan)
                });

            });
            statusPanel.setAttribute("verbosee", "true");
        }
    });
}