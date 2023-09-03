import * as THREE from "three";
import Analyser from "./Analyser";
import { IUpdatable } from "../../../../ts/interfaces/IUpdatable";
export declare class VideoPoints implements IUpdatable {
    updateOrder: number;
    scene: THREE.Scene;
    video: HTMLVideoElement;
    points: THREE.Points;
    position: THREE.Vector3;
    fftSize: number;
    analyser: Analyser;
    constructor(scene: THREE.Scene, position?: THREE.Vector3);
    setupVideo(id_video?: string): void;
    setupPoints(): void;
    setupAnalyser(): void;
    update(timestep: number, unscaledTimeStep: number): void;
}
