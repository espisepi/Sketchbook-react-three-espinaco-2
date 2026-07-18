import * as THREE from "three";
import * as CANNON from "cannon";
import type { World } from "../World";
import { IUpdatable } from "../../interfaces/IUpdatable";

export class ProceduralTerrain implements IUpdatable {
    public updateOrder: number = 2;

    private world: World;
    private mesh: THREE.Mesh | undefined;
    private material: THREE.MeshStandardMaterial | undefined;
    private geometry: THREE.PlaneGeometry | undefined;
    private body: CANNON.Body | undefined;
    private params: any;
    private raycaster: THREE.Raycaster;
    private pointer: THREE.Vector2;
    private isSculpting: boolean = false;
    private brushMode: "raise" | "lower" = "raise";
    private heightValues: number[] = [];
    private heightData: number[][] = [];

    constructor(world: World) {
        this.world = world;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.params = {
            size: 220,
            height: 18,
            roughness: 1.35,
            segments: 80,
            wireframe: false,
            Edit_Enabled: true,
            Brush_Size: 10,
            Brush_Strength: 1.2,
            Brush_Mode: "raise",
        };

        this.world.registerUpdatable(this);
        this.bindEvents();
        this.build();
    }

    public update(_: number, __: number): void {
        if (!this.params.Edit_Enabled || !this.isSculpting || !this.mesh || !this.geometry) {
            return;
        }

        this.sculptAtPointer();
    }

    public updateFromParams(params?: any): void {
        if (params) {
            this.params.size = params.Terrain_Size;
            this.params.height = params.Terrain_Height;
            this.params.roughness = params.Terrain_Roughness;
            this.params.segments = params.Terrain_Segments;
            this.params.wireframe = params.Terrain_Wireframe;
            this.params.Edit_Enabled = params.Terrain_Edit_Enabled;
            this.params.Brush_Size = params.Brush_Size;
            this.params.Brush_Strength = params.Brush_Strength;
            this.params.Brush_Mode = params.Brush_Mode;
        }

        const needsRebuild = params !== undefined && (
            params.Terrain_Size !== undefined ||
            params.Terrain_Height !== undefined ||
            params.Terrain_Roughness !== undefined ||
            params.Terrain_Segments !== undefined ||
            params.Terrain_Wireframe !== undefined
        );

        if (needsRebuild) {
            this.build();
        }
    }

    private bindEvents(): void {
        const onPointerDown = (event: MouseEvent) => {
            if (!this.params.Edit_Enabled) {
                return;
            }

            this.updatePointer(event);
            if (event.button === 0) {
                this.brushMode = "raise";
                this.isSculpting = true;
            } else if (event.button === 2) {
                this.brushMode = "lower";
                this.isSculpting = true;
            }

            if (this.isSculpting) {
                event.preventDefault();
                this.sculptAtPointer();
            }
        };

        const onPointerMove = (event: MouseEvent) => {
            this.updatePointer(event);
            if (this.isSculpting) {
                this.sculptAtPointer();
            }
        };

        const onPointerUp = () => {
            this.isSculpting = false;
        };

        window.addEventListener("mousedown", onPointerDown);
        window.addEventListener("mousemove", onPointerMove);
        window.addEventListener("mouseup", onPointerUp);
        window.addEventListener("contextmenu", (event) => {
            if (this.params.Edit_Enabled) {
                event.preventDefault();
            }
        });
    }

    private updatePointer(event: MouseEvent): void {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    private sculptAtPointer(): void {
        if (!this.mesh || !this.geometry || !this.params.Edit_Enabled) {
            return;
        }

        this.raycaster.setFromCamera(this.pointer, this.world.camera);
        const intersects = this.raycaster.intersectObject(this.mesh, false);
        if (intersects.length === 0) {
            return;
        }

        const hitPoint = intersects[0].point.clone();
        const localPoint = this.mesh.worldToLocal(hitPoint.clone());
        const radius = this.params.Brush_Size;
        const strength = this.params.Brush_Strength;
        const direction = this.brushMode === "lower" ? -1 : 1;
        const maxHeight = this.params.height * 1.4;

        for (let row = 0; row <= this.params.segments; row++) {
            for (let col = 0; col <= this.params.segments; col++) {
                const index = row * (this.params.segments + 1) + col;
                const vertex = this.geometry.vertices[index];
                const dx = vertex.x - localPoint.x;
                const dz = vertex.z - localPoint.z;
                const distance = Math.sqrt(dx * dx + dz * dz);

                if (distance <= radius) {
                    const falloff = 1 - distance / radius;
                    const delta = falloff * strength * 0.08 * direction;
                    const nextHeight = Math.max(-maxHeight, Math.min(maxHeight, this.heightValues[index] + delta));
                    this.heightValues[index] = nextHeight;
                    vertex.y = nextHeight;
                }
            }
        }

        this.geometry.verticesNeedUpdate = true;
        this.geometry.computeVertexNormals();
        this.syncPhysicsBody();
    }

    private build(): void {
        this.dispose();

        const size = this.params.size;
        const segments = this.params.segments;
        const heightScale = this.params.height;
        const roughness = this.params.roughness;

        const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
        geometry.rotateX(-Math.PI / 2);
        this.heightValues = [];

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

                this.heightValues.push(y);
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

        this.mesh = mesh;
        this.geometry = geometry;
        this.material = material;
        this.syncPhysicsBody();
    }

    private syncPhysicsBody(): void {
        if (!this.geometry || !this.mesh) {
            return;
        }

        const segments = this.params.segments;
        const rows = segments + 1;
        const cols = segments + 1;
        const heightData: number[][] = [];

        for (let row = 0; row < rows; row++) {
            const rowValues: number[] = [];
            for (let col = 0; col < cols; col++) {
                const index = row * rows + col;
                rowValues.push(this.heightValues[index] || 0);
            }
            heightData.push(rowValues);
        }

        this.heightData = heightData;

        if (this.body) {
            (this.world.physicsWorld as any).removeBody(this.body);
            this.body = undefined;
        }

        const maxValue = this.getMaxHeight(heightData);
        const minValue = this.getMinHeight(heightData);
        const shape = new CANNON.Heightfield(heightData as any, {
            elementSize: this.params.size / segments,
            maxValue,
            minValue,
        });

        const body = new CANNON.Body({
            mass: 0,
            material: new CANNON.Material("terrain"),
        });
        body.addShape(shape);
        body.position.set(0, 0, 0);
        body.quaternion.set(0, 0, 0, 1);
        body.updateBoundingRadius();

        this.world.physicsWorld.addBody(body);
        this.body = body;
    }

    private getMaxHeight(heightData: number[][]): number {
        let maxValue = -Infinity;
        for (let row = 0; row < heightData.length; row++) {
            for (let col = 0; col < heightData[row].length; col++) {
                maxValue = Math.max(maxValue, heightData[row][col]);
            }
        }
        return Number.isFinite(maxValue) ? maxValue : 0;
    }

    private getMinHeight(heightData: number[][]): number {
        let minValue = Infinity;
        for (let row = 0; row < heightData.length; row++) {
            for (let col = 0; col < heightData[row].length; col++) {
                minValue = Math.min(minValue, heightData[row][col]);
            }
        }
        return Number.isFinite(minValue) ? minValue : 0;
    }

    private dispose(): void {
        if (this.body) {
            (this.world.physicsWorld as any).removeBody(this.body);
            this.body = undefined;
        }

        if (this.mesh && this.geometry && this.material) {
            this.world.graphicsWorld.remove(this.mesh);
            this.geometry.dispose();
            this.material.dispose();
            this.mesh = undefined;
            this.geometry = undefined;
            this.material = undefined;
        }

        this.heightValues = [];
        this.heightData = [];
    }
}