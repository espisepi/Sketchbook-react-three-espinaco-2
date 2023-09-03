import * as THREE from "three";
import VideoPointsMaterial from "./VideoPointsMaterial";
import Analyser from "./Analyser";
import { IUpdatable } from "../../../../ts/interfaces/IUpdatable";

export class VideoPoints implements IUpdatable {
  public updateOrder: number = 10;

  public scene: THREE.Scene;
  public video: HTMLVideoElement;
  public points: THREE.Points;
  public position: THREE.Vector3;

  public fftSize: number;
  public analyser: Analyser;

  constructor(
    scene: THREE.Scene,
    position: THREE.Vector3 = new THREE.Vector3(0, 100, -500)
  ) {
    console.log("Hola mundo videopoints");

    this.scene = scene;
    this.fftSize = this.fftSize;
    this.position = position;

    this.setupVideo();
  }

  public setupVideo(id_video: string = "video") {
    const self = this;
    const id_interval = setInterval(() => {
      const videoEl: HTMLVideoElement = document.getElementById(
        id_video
      ) as HTMLVideoElement;
      if (videoEl && videoEl.videoWidth !== 0 && videoEl.videoHeight !== 0) {
        this.video = videoEl;
        console.log("Video encontrado!");
        clearInterval(id_interval);
        self.setupPoints();
        self.setupAnalyser();
      }
    }, 100);
  }

  public setupPoints() {
    if (!this.video) {
      console.warn(
        "Video no encontrado, no se puede instanciar VideoPoints correctamente"
      );
      // return; // Lo comentamos porque queremos que se instancien los points
    }
    const video = this.video;
    // Define Geometry
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    for (let y = 0, height = videoHeight; y < height; y += 1) {
      for (let x = 0, width = videoWidth; x < width; x += 1) {
        const vertex = new THREE.Vector3(
          x - videoWidth / 2,
          -y + videoHeight / 2,
          0
        );
        positions.push(vertex.x, vertex.y, vertex.z);
        uvs.push(x / videoWidth, y / videoHeight);
      }
    }
    console.log("video height: " + videoHeight);
    console.log("video width: " + videoWidth);

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

    // Define Material
    const material = new VideoPointsMaterial();
    material.uniforms.iChannel0.value = new THREE.VideoTexture(video);

    // Define Points
    const particles = new THREE.Points(geometry, material);
    particles.rotation.x += Math.PI;

    particles.position.set(this.position.x, this.position.y, this.position.z);

    // Temporal
    // particles.position.z += -200.0;
    // particles.scale.set(0.5,0.5,0.5);

    this.scene.add(particles);
    this.points = particles;

    // Esto lo hacemos para acceder al videoPoints en cualquier parte del codigo (por ejemplo para cambiar atributos del shader como el tamano de los puntos)
    // window.videoPoints = particles;
  }

  public setupAnalyser() {
    this.analyser = new Analyser(this.video, this.fftSize);
  }

  public update(timestep: number, unscaledTimeStep: number): void {
    if (this.analyser && this.points) {
      (this.points.material as VideoPointsMaterial).uniforms.bass.value =
        this.analyser.getUpdateLowerMax();
    }
  }
}
