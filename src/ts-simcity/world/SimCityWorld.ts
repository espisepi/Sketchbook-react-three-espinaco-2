import { World } from "src/ts/sketchbook";
import { SimCityGame } from "../game/SimCityGame";

export class SimCityWorld {

    constructor(world: World) {
        console.log("Hello World Sim City World, world sketchbook: ", world);

        const simcityGame = new SimCityGame();
    }
}