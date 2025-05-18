import { World } from "../World";
import { ProceduralTerrain } from "./ProceduralTerrain";



export class ProceduralTerrainWorld {

    constructor(world: World) {
        console.log("INIT ProceduralTerrainWorld ------------- ");
        const proceduralTerrain = new ProceduralTerrain();
    }
}