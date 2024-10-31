import * as THREE from "three";

export class CustomGeometry {
  private bufferGeometry: THREE.BufferGeometry;
  public vertices: THREE.Vector3[] = [];
  public faces: { a: number; b: number; c: number; normal: THREE.Vector3; vertexNormals: THREE.Vector3[] }[] = [];
  public normals: THREE.Vector3[] = [];

  constructor() {
    this.bufferGeometry = new THREE.BufferGeometry();
  }

  addVertex(vertex: THREE.Vector3) {
    this.vertices.push(vertex);
  }

  addFace(a: number, b: number, c: number, normal?: THREE.Vector3, vertexNormals?: THREE.Vector3[]) {
    this.faces.push({ a, b, c, normal: normal || new THREE.Vector3(), vertexNormals: vertexNormals || [] });
  }

  // Nuevo método scale para aplicar escalado a los vértices
  scale(x: number, y: number, z: number) {
    const scaleMatrix = new THREE.Matrix4().makeScale(x, y, z);

    // Aplica la escala a cada vértice
    this.vertices.forEach(vertex => vertex.applyMatrix4(scaleMatrix));

    // Actualiza el bufferGeometry interno después de aplicar el escalado
    this.updateBufferGeometry();
  }

  merge(geometry: CustomGeometry, matrix?: THREE.Matrix4) {
    const bufferGeometry = geometry.toBufferGeometry();
    if (matrix) {
      bufferGeometry.applyMatrix4(matrix);
    }
    this.addBufferGeometry(bufferGeometry);
  }

  applyMatrix(matrix: THREE.Matrix4) {
    const bufferGeometry = this.toBufferGeometry();
    bufferGeometry.applyMatrix4(matrix);
    this.fromBufferGeometry(bufferGeometry);
  }

  toBufferGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];

    for (const vertex of this.vertices) {
      vertices.push(vertex.x, vertex.y, vertex.z);
    }

    for (const face of this.faces) {
      indices.push(face.a, face.b, face.c);

      if (face.normal) {
        normals.push(face.normal.x, face.normal.y, face.normal.z);
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));

    this.bufferGeometry = geometry;
    return geometry;
  }

  fromBufferGeometry(geometry: THREE.BufferGeometry) {
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");

    this.vertices = [];
    for (let i = 0; i < position.count; i++) {
      this.vertices.push(new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i)));
    }

    this.normals = [];
    if (normal) {
      for (let i = 0; i < normal.count; i++) {
        this.normals.push(new THREE.Vector3(normal.getX(i), normal.getY(i), normal.getZ(i)));
      }
    }
  }

  addBufferGeometry(geometry: THREE.BufferGeometry) {
    const position = geometry.getAttribute("position");
    const index = geometry.getIndex();

    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const a = index.getX(i);
        const b = index.getX(i + 1);
        const c = index.getX(i + 2);
        this.addFace(a, b, c);
      }
    } else {
      for (let i = 0; i < position.count; i += 3) {
        this.addFace(i, i + 1, i + 2);
      }
    }
  }

  // Método adicional para actualizar bufferGeometry después de cambiar vértices
  private updateBufferGeometry() {
    this.toBufferGeometry();
  }

  getBufferGeometry(): THREE.BufferGeometry {
    return this.bufferGeometry;
  }
}
