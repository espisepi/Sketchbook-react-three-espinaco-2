import * as THREE from "three";
import { World } from "../World";
interface TerrainChunkOptions {
    chunkX: number;
    chunkZ: number;
    chunkSize: number;
    segments: number;
    material: THREE.Material;
}
export declare class TerrainChunk {
    private readonly mesh;
    private readonly body;
    constructor(options: TerrainChunkOptions);
    addToWorld(world: World, parent: THREE.Group): void;
    dispose(world: World): void;
    private applyVertexColors;
}
export {};
