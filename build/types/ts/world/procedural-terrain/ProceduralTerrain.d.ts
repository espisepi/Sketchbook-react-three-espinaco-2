import type { World } from "../World";
export declare class ProceduralTerrain {
    private world;
    private mesh;
    private material;
    private geometry;
    private body;
    private params;
    constructor(world: World);
    updateFromParams(params?: any): void;
    private build;
    private dispose;
}
