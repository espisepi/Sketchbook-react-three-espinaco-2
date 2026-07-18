import type { World } from "../World";
import { IUpdatable } from "../../interfaces/IUpdatable";
export declare class ProceduralTerrain implements IUpdatable {
    updateOrder: number;
    private world;
    private mesh;
    private material;
    private geometry;
    private body;
    private params;
    private raycaster;
    private pointer;
    private isSculpting;
    private brushMode;
    private heightValues;
    private heightData;
    constructor(world: World);
    update(_: number, __: number): void;
    updateFromParams(params?: any): void;
    private bindEvents;
    private updatePointer;
    private sculptAtPointer;
    private build;
    private syncPhysicsBody;
    private getMaxHeight;
    private getMinHeight;
    private dispose;
}
