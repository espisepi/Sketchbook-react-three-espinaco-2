import * as THREE from "three";

import { World } from "../World";
import { TerrainChunk } from "./TerrainChunk";

export class ProceduralTerrain {
  public readonly group: THREE.Group = new THREE.Group();

  private readonly chunks: Map<string, TerrainChunk> = new Map();
  private readonly world: World;
  private readonly chunkSize: number = 200;
  private readonly viewDistance: number = 2;
  private readonly segments: number = 24;
  private readonly material: THREE.MeshStandardMaterial;
  private centerX: number = Number.NaN;
  private centerZ: number = Number.NaN;

  constructor(world: World) {
    this.world = world;
    this.group.name = "Procedural terrain";
    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.95,
      metalness: 0,
    });
  }

  public update(): void {
    const target = this.world.cameraOperator.target;
    const nextCenterX = Math.floor(target.x / this.chunkSize);
    const nextCenterZ = Math.floor(target.z / this.chunkSize);

    if (nextCenterX === this.centerX && nextCenterZ === this.centerZ) {
      return;
    }

    this.centerX = nextCenterX;
    this.centerZ = nextCenterZ;
    this.updateChunks();
  }

  public dispose(): void {
    this.chunks.forEach((chunk) => chunk.dispose(this.world));
    this.chunks.clear();
    this.group.removeFromParent();
    this.material.dispose();
  }

  private updateChunks(): void {
    const requiredKeys = new Set<string>();

    for (
      let chunkX = this.centerX - this.viewDistance;
      chunkX <= this.centerX + this.viewDistance;
      chunkX++
    ) {
      for (
        let chunkZ = this.centerZ - this.viewDistance;
        chunkZ <= this.centerZ + this.viewDistance;
        chunkZ++
      ) {
        const key = `${chunkX},${chunkZ}`;
        requiredKeys.add(key);

        if (!this.chunks.has(key)) {
          const chunk = new TerrainChunk({
            chunkX,
            chunkZ,
            chunkSize: this.chunkSize,
            segments: this.segments,
            material: this.material,
          });
          chunk.addToWorld(this.world, this.group);
          this.chunks.set(key, chunk);
        }
      }
    }

    this.chunks.forEach((chunk, key) => {
      if (!requiredKeys.has(key)) {
        chunk.dispose(this.world);
        this.chunks.delete(key);
      }
    });
  }
}
