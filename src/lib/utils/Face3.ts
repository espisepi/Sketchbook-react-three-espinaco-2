import * as THREE from "three";

export class Face3 {
  a: number;
  b: number;
  c: number;
  normal: THREE.Vector3;
  vertexNormals: THREE.Vector3[];

  constructor(a: number, b: number, c: number, normal?: THREE.Vector3, vertexNormals?: THREE.Vector3[]) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.normal = normal || new THREE.Vector3();
    this.vertexNormals = vertexNormals || [];
  }
}

// Ejemplo de clase CustomGeometry para compatibilidad
class CustomGeometry extends THREE.BufferGeometry {
  public vertices: THREE.Vector3[] = [];
  public faces: Face3[] = [];

  addVertex(vertex: THREE.Vector3) {
    this.vertices.push(vertex);
  }

  addFace(a: number, b: number, c: number, normal?: THREE.Vector3, vertexNormals?: THREE.Vector3[]) {
    this.faces.push(new Face3(a, b, c, normal, vertexNormals));
  }

  toBufferGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];

    for (const vertex of this.vertices) {
      vertices.push(vertex.x, vertex.y, vertex.z);
    }

    for (const face of this.faces) {
      indices.push(face.a, face.b, face.c);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    return geometry;
  }
}
