import * as THREE from "three";
export declare class CustomGeometry {
    private bufferGeometry;
    vertices: THREE.Vector3[];
    faces: {
        a: number;
        b: number;
        c: number;
        normal: THREE.Vector3;
        vertexNormals: THREE.Vector3[];
    }[];
    normals: THREE.Vector3[];
    constructor();
    addVertex(vertex: THREE.Vector3): void;
    addFace(a: number, b: number, c: number, normal?: THREE.Vector3, vertexNormals?: THREE.Vector3[]): void;
    scale(x: number, y: number, z: number): void;
    merge(geometry: CustomGeometry, matrix?: THREE.Matrix4): void;
    applyMatrix(matrix: THREE.Matrix4): void;
    toBufferGeometry(): THREE.BufferGeometry;
    fromBufferGeometry(geometry: THREE.BufferGeometry): void;
    addBufferGeometry(geometry: THREE.BufferGeometry): void;
    private updateBufferGeometry;
    getBufferGeometry(): THREE.BufferGeometry;
}
