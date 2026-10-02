import * as CANNON from "cannon";
import * as THREE from "three";

import { World } from "../World";
import { TerrainNoise } from "./TerrainNoise";

interface TerrainChunkOptions {
  chunkX: number;
  chunkZ: number;
  chunkSize: number;
  segments: number;
  material: THREE.Material;
}

export class TerrainChunk {
  private readonly mesh: THREE.Mesh;
  private readonly body: CANNON.Body;

  constructor(options: TerrainChunkOptions) {
    const { chunkX, chunkZ, chunkSize, segments, material } = options;
    const geometry = new THREE.BufferGeometry();
    const vertexCount = (segments + 1) * (segments + 1);
    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    const indices: number[] = [];
    const heightMap: number[][] = Array.from(
      { length: segments + 1 },
      () => Array(segments + 1).fill(0)
    );
    const step = chunkSize / segments;
    const originX = chunkX * chunkSize;
    const originZ = chunkZ * chunkSize;
    const terrainNoise = new TerrainNoise();

    for (let z = 0; z <= segments; z++) {
      for (let x = 0; x <= segments; x++) {
        const worldX = originX + x * step;
        const worldZ = originZ + z * step;
        const height = terrainNoise.heightAt(worldX, worldZ);
        const vertex = z * (segments + 1) + x;
        positions[vertex * 3] = x * step;
        positions[vertex * 3 + 1] = height;
        positions[vertex * 3 + 2] = z * step;

        // Cannon's heightfield plane uses local +Y for its second axis.
        heightMap[x][segments - z] = height;
      }
    }

    for (let z = 0; z < segments; z++) {
      for (let x = 0; x < segments; x++) {
        const a = z * (segments + 1) + x;
        const b = a + 1;
        const c = a + segments + 1;
        const d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    this.applyVertexColors(
      geometry,
      positions,
      colors,
      vertexCount,
      originX,
      originZ
    );

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.name = `Terrain ${chunkX},${chunkZ}`;
    this.mesh.position.set(originX, 0, originZ);
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;

    const heightfield = new CANNON.Heightfield(heightMap, {
      elementSize: step,
    });
    this.body = new CANNON.Body({
      mass: 0,
      shape: heightfield,
      position: new CANNON.Vec3(originX, 0, originZ + chunkSize),
    });
    this.body.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    );
  }

  public addToWorld(world: World, parent: THREE.Group): void {
    parent.add(this.mesh);
    world.physicsWorld.addBody(this.body);
  }

  public dispose(world: World): void {
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    world.physicsWorld.remove(this.body);
  }

  private applyVertexColors(
    geometry: THREE.BufferGeometry,
    positions: Float32Array,
    colors: Float32Array,
    vertexCount: number,
    originX: number,
    originZ: number
  ): void {
    const normals = geometry.getAttribute("normal");
    const color = new THREE.Color();
    const lowland = new THREE.Color(0x9b895c);
    const grass = new THREE.Color(0x587647);
    const rock = new THREE.Color(0x77756c);
    const snow = new THREE.Color(0xd9d8ce);

    for (let vertex = 0; vertex < vertexCount; vertex++) {
      const height = positions[vertex * 3 + 1];
      const slope = 1 - normals.getY(vertex);
      if (height < -3) {
        color.copy(lowland);
      } else if (height > 31) {
        color.copy(snow);
      } else if (slope > 0.24 || height > 19) {
        color.copy(rock);
      } else {
        color.copy(grass);
      }

      const variation = 0.94 + TerrainNoise.colorVariation(
        originX + positions[vertex * 3],
        originZ + positions[vertex * 3 + 2]
      ) * 0.12;
      color.multiplyScalar(variation);
      colors[vertex * 3] = color.r;
      colors[vertex * 3 + 1] = color.g;
      colors[vertex * 3 + 2] = color.b;
    }

    geometry.getAttribute("color").needsUpdate = true;
  }
}
