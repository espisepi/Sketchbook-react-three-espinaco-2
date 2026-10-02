import { Object3D, Vector3 } from 'three';
export declare class Wheel {
    wheelObject: Object3D;
    position: Vector3;
    steering: boolean;
    drive: string;
    rayCastWheelInfoIndex: number;
    constructor(wheelObject: Object3D);
}
