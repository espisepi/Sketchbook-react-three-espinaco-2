import { World } from "../World";
import { ProceduralTerrain } from "./ProceduralTerrain";

export class ProceduralTerrainWorld {
    public terrain: ProceduralTerrain;

    constructor(world: World) {
        console.log("INIT ProceduralTerrainWorld ------------- ");
        this.terrain = new ProceduralTerrain(world);
    }
}