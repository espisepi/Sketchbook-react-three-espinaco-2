import * as THREE from "three";
export declare class Face3 {
    a: number;
    b: number;
    c: number;
    normal: THREE.Vector3;
    vertexNormals: THREE.Vector3[];
    constructor(a: number, b: number, c: number, normal?: THREE.Vector3, vertexNormals?: THREE.Vector3[]);
}
