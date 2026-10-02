import { World } from "../World";
import { IUpdatable } from "../../interfaces/IUpdatable";
export declare class ProceduralTerrainWorld implements IUpdatable {
    readonly updateOrder: number;
    private readonly world;
    private readonly terrain;
    constructor(world: World);
    update(_timeStep: number, _unscaledTimeStep: number): void;
    dispose(): void;
}
