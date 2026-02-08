import * as THREE from 'three';
import { IUpdatable } from '../interfaces/IUpdatable';
import { World } from './World';
export declare class ReplaceTextureVideoclip implements IUpdatable {
    updateOrder: number;
    graphicsWorld: THREE.Scene;
    physicsWorld: CANNON.World;
    world: World;
    videoTexture: THREE.VideoTexture;
    private isVideoTextureInAllObjects;
    constructor(world: World);
    update(timestep: number, unscaledTimeStep: number): void;
    private replaceMaterials;
    private createVideoElement;
}
