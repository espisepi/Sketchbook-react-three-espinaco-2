import { World } from "../ts/sketchbook";
import {SimCityWorld} from "../ts-simcity/simcity";

export class Game {

    constructor() {
        console.log("Game hello world");
		const world = new World('build/assets/catedral.glb');
        console.log("sketchbook world: ", world);

        const simcityWorld = new SimCityWorld(world);
    }
}