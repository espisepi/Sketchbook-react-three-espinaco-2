/*
 Reference file:
 - https://threejs.org/examples/#webgl_instancing_morph
 - https://github.com/mrdoob/three.js/blob/master/examples/webgl_instancing_morph.html
*/

import * as THREE from "three";
import { IUpdatable } from "../../../../ts/interfaces/IUpdatable";
import { LoadingManager } from "../../../../ts/core/LoadingManager";

export class HorseScene implements IUpdatable {
  public updateOrder: number = 20;

  private HEIGHT_FROM_BOTTOM = 30;

  private scene: THREE.Scene;
  private loadingManager: LoadingManager;

  // Attributes for Horses
  private mesh: THREE.Mesh;
  private mixer: THREE.AnimationMixer;
  private timeOffsets: Float32Array;
  private dummy: THREE.Object3D;

  constructor(scene: THREE.Scene, loadingManager: LoadingManager) {
    this.scene = scene;
    this.loadingManager = loadingManager;

    this.createScene();
  }

  private createScene() {
    // this.createGround();
    this.createHorses();
  }

  private createGround(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1000000, 1000000),
      new THREE.MeshStandardMaterial({ color: 0x669933, depthWrite: true })
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = this.HEIGHT_FROM_BOTTOM;

    ground.receiveShadow = true;

    this.scene.add(ground);
  }

  private createHorses(): void {
    const loadingManager = this.loadingManager;
    const scene = this.scene;

    let mesh, mixer, dummy;

    const offset = 5000;

    const timeOffsets = new Float32Array(1024);

    for (let i = 0; i < 1024; i++) {
      timeOffsets[i] = Math.random() * 3;
    }

    loadingManager.loadGLTF("build/assets/custom/horse.glb", (glb) => {
      dummy = glb.scene.children[0];

      mesh = new THREE.InstancedMesh(dummy.geometry, dummy.material, 1024);

      mesh.castShadow = true;

      for (let x = 0, i = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
          dummy.position.set(
            offset - 300 * x + 200 * Math.random(),
            0,
            offset - 300 * y
          );

          dummy.updateMatrix();

          mesh.setMatrixAt(i, dummy.matrix);

        //   mesh.setColorAt(
        //     i,
        //     new THREE.Color(`hsl(${Math.random() * 360}, 50%, 66%)`)
        //   );

          i++;
        }
      }

      scene.add(mesh);

      mixer = new THREE.AnimationMixer(glb.scene);

      const action = mixer.clipAction(glb.animations[0]);

      action.play();
    });

    this.mesh = mesh;
    this.mixer = mixer;
    this.timeOffsets = timeOffsets;
    this.dummy = dummy;
  }

  update(timestep: number, unscaledTimeStep: number): void {
    const time = timestep;

    const r = 3000;

    if (this.mesh) {
      for (let i = 0; i < 1024; i++) {
        this.mixer.setTime(time + this.timeOffsets[i]);

        // this.mesh.setMorphAt(i, this.dummy);
      }

    //   this.mesh.morphTexture.needsUpdate = true;
    }
  }
}
