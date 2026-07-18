import * as THREE from "three";
import * as CANNON from "cannon";
import type { World } from "../World";

export class ProceduralTerrain {
    private world: World;
    private mesh: THREE.Mesh | undefined;
    private material: THREE.MeshStandardMaterial | undefined;
    private geometry: THREE.PlaneGeometry | undefined;
    private body: CANNON.Body | undefined;
    private params: any;

    constructor(world: World) {
        debugger;
        this.world = world;
        this.params = {
            size: 220,
            height: 18,
            roughness: 1.35,
            segments: 80,
            wireframe: false,
        };

        this.build();
    }

    public updateFromParams(params?: any): void {
        if (params) {
            this.params.size = params.Terrain_Size;
            this.params.height = params.Terrain_Height;
            this.params.roughness = params.Terrain_Roughness;
            this.params.segments = params.Terrain_Segments;
            this.params.wireframe = params.Terrain_Wireframe;
        }

        this.build();
    }

    private build(): void {
        this.dispose();

        const size = this.params.size;
        const segments = this.params.segments;
        const heightScale = this.params.height;
        const roughness = this.params.roughness;

        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
        geometry.rotateX(-Math.PI / 2);

        const heightfieldData: number[] = [];

        for (let row = 0; row <= segments; row++) {
            for (let col = 0; col <= segments; col++) {
                const index = row * (segments + 1) + col;
                const x = (col / segments) - 0.5;
                const z = (row / segments) - 0.5;

                const waveA = Math.sin(x * Math.PI * 3 + roughness) * 0.5;
                const waveB = Math.cos(z * Math.PI * 2.4 + roughness * 0.6) * 0.5;
                const ridge = Math.sin((x + z) * Math.PI * 2.2) * 0.25;
                const noise =
                    (Math.sin((x + 1.7) * 15 + roughness * 3) +
                        Math.cos((z - 1.1) * 11 + roughness * 2.2)) *
                    0.1;
                const y = (waveA + waveB + ridge + noise) * heightScale;

                heightfieldData.push(y);
                geometry.vertices[index].y = y;
            }
        }

        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0x5e7c53,
            roughness: 0.95,
            metalness: 0.05,
            flatShading: true,
            wireframe: this.params.wireframe,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        mesh.position.set(0, 0, 0);

        this.world.graphicsWorld.add(mesh);

        const elementSize = size / segments;
        const heightfieldShape = new CANNON.Heightfield(heightfieldData, {
            elementSize,
        });

        const body = new CANNON.Body({
            mass: 0,
            material: new CANNON.Material("terrain"),
        });
        body.addShape(heightfieldShape);
        body.position.set(0, 0, 0);
        body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        body.updateBoundingRadius();

        this.world.physicsWorld.addBody(body);

        this.mesh = mesh;
        this.geometry = geometry;
        this.material = material;
        this.body = body;
    }

    private dispose(): void {
        if (this.mesh && this.geometry && this.material) {
            this.world.graphicsWorld.remove(this.mesh);
            this.geometry.dispose();
            this.material.dispose();
            this.mesh = undefined;
            this.geometry = undefined;
            this.material = undefined;
        }

        if (this.body) {
            (this.world.physicsWorld as any).removeBody(this.body);
            this.body = undefined;
        }
    }
}