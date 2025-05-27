import { World } from "../ts/sketchbook";
import {SimCityWorld} from "../ts-simcity/simcity";

export class Game {

    constructor() {
        console.log("Game hello world");
		const sketchbookWorld = new World('build/assets/catedral.glb');
        console.log("sketchbook world: ", sketchbookWorld);

        // TODO: 
        // Hacer esta funcionalidad en esta clase Game (o crear una clase nueva y llamarla desde esta clase
        // pasandole por atributos simcityworld y sketchbookWorld )
        // Cuando utilizo simcityWorld -> desactivo todos los input y render y updates de sketchbook
        // Cuando utilizo sketchbook -> desactivo todos los input y render y updates de simcityWorld
        const simcityWorld = new SimCityWorld(sketchbookWorld);
    }
}