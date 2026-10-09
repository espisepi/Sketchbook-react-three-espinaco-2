import { IUpdatable } from "../interfaces/IUpdatable";
import { World } from "./World";
declare global {
    interface Window {
        CESIUM_ION_ACCESS_TOKEN?: string;
    }
}
export declare class CesiumSevilleBuildings implements IUpdatable {
    readonly updateOrder: number;
    private readonly world;
    private readonly georeferencedGroup;
    private readonly attributionElement;
    private tilesRenderer;
    private cameraState;
    private enabled;
    private loadErrorShown;
    constructor(world: World);
    setEnabled(enabled: boolean): Promise<boolean>;
    update(): void;
    dispose(): void;
    private createTilesRenderer;
    private focusSeville;
    private restoreCamera;
    private updateAttribution;
    private createEcefToLocalMatrix;
}
