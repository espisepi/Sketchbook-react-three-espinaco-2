import * as THREE from "three";
import { World } from "../World";
export declare class ProceduralTerrain {
    readonly group: THREE.Group;
    private readonly chunks;
    private readonly world;
    private readonly chunkSize;
    private readonly viewDistance;
    private readonly segments;
    private readonly material;
    private centerX;
    private centerZ;
    constructor(world: World);
    update(): void;
    dispose(): void;
    private updateChunks;
}
