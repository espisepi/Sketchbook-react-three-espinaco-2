import * as THREE from "three";
import { IUpdatable } from "../../../../ts/interfaces/IUpdatable";
import { LoadingManager } from "../../../../ts/core/LoadingManager";
export declare class HorseScene implements IUpdatable {
    updateOrder: number;
    private HEIGHT_FROM_BOTTOM;
    private scene;
    private loadingManager;
    private mesh;
    private mixer;
    private timeOffsets;
    private dummy;
    constructor(scene: THREE.Scene, loadingManager: LoadingManager);
    private createScene;
    private createGround;
    private createHorses;
    update(timestep: number, unscaledTimeStep: number): void;
}
