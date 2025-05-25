import { World } from "../ts/sketchbook";

export class Game {

    constructor() {
        console.log("Game hello world");
		const world = new World('build/assets/catedral.glb');

    }
}