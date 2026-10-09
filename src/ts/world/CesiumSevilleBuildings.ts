import { TilesRenderer } from "3d-tiles-renderer";
import { CesiumIonAuthPlugin } from "3d-tiles-renderer/src/three/plugins/CesiumIonAuthPlugin.js";
import * as THREE from "three";
import Swal from "sweetalert2";

import { IUpdatable } from "../interfaces/IUpdatable";
import { World } from "./World";

declare global {
  interface Window {
    CESIUM_ION_ACCESS_TOKEN?: string;
  }
}

interface CameraState {
  target: THREE.Vector3;
  theta: number;
  phi: number;
  radius: number;
  targetRadius: number;
  far: number;
}

const SEVILLE_BUILDINGS_ASSET_ID = "96188";
const SEVILLE_LONGITUDE = -5.9845;
const SEVILLE_LATITUDE = 37.3891;

export class CesiumSevilleBuildings implements IUpdatable {
  public readonly updateOrder: number = 10;

  private readonly world: World;
  private readonly georeferencedGroup: THREE.Group = new THREE.Group();
  private readonly attributionElement: HTMLDivElement;
  private tilesRenderer: TilesRenderer;
  private cameraState: CameraState;
  private enabled: boolean = false;
  private loadErrorShown: boolean = false;

  constructor(world: World) {
    this.world = world;
    this.georeferencedGroup.name = "Cesium Seville buildings";
    this.georeferencedGroup.matrixAutoUpdate = false;
    this.georeferencedGroup.matrix.copy(this.createEcefToLocalMatrix());
    this.georeferencedGroup.visible = false;
    this.world.graphicsWorld.add(this.georeferencedGroup);

    this.attributionElement = document.createElement("div");
    this.attributionElement.style.cssText =
      "position:fixed;right:8px;bottom:8px;z-index:5;display:none;" +
      "max-width:45vw;padding:4px 7px;background:rgba(0,0,0,.65);" +
      "color:#fff;font:11px/1.4 sans-serif;text-shadow:none;" +
      "pointer-events:none;user-select:none;";
    document.body.appendChild(this.attributionElement);

    this.world.registerUpdatable(this);
  }

  public async setEnabled(enabled: boolean): Promise<boolean> {
    if (enabled === this.enabled) {
      return true;
    }

    if (!enabled) {
      this.enabled = false;
      this.georeferencedGroup.visible = false;
      this.attributionElement.style.display = "none";
      this.restoreCamera();
      return true;
    }

    let accessToken = window.CESIUM_ION_ACCESS_TOKEN;
    if (!accessToken) {
      const result = await Swal.fire({
        title: "Token de Cesium ion",
        text: "Introduce un token de Cesium ion con acceso al asset de edificios.",
        input: "password",
        inputPlaceholder: "Cesium ion access token",
        showCancelButton: true,
        confirmButtonText: "Cargar Sevilla",
        cancelButtonText: "Cancelar",
        buttonsStyling: false,
      });

      if (result.dismiss || typeof result.value !== "string" || !result.value) {
        return false;
      }
      accessToken = result.value;
    }

    this.loadErrorShown = false;
    if (!this.tilesRenderer) {
      this.createTilesRenderer(accessToken);
    } else {
      this.tilesRenderer.resetFailedTiles();
    }

    this.enabled = true;
    this.georeferencedGroup.visible = true;
    this.attributionElement.style.display = "block";
    this.focusSeville();
    return true;
  }

  public update(): void {
    if (!this.enabled || !this.tilesRenderer) {
      return;
    }

    this.world.camera.updateMatrixWorld(true);
    this.world.graphicsWorld.updateMatrixWorld(true);
    this.tilesRenderer.setCamera(this.world.camera);
    this.tilesRenderer.setResolutionFromRenderer(
      this.world.camera,
      this.world.renderer
    );
    this.tilesRenderer.update();
    this.updateAttribution();
  }

  public dispose(): void {
    this.world.unregisterUpdatable(this);
    if (this.tilesRenderer) {
      this.tilesRenderer.dispose();
      this.tilesRenderer.group.removeFromParent();
    }
    this.georeferencedGroup.removeFromParent();
    this.attributionElement.remove();
  }

  private createTilesRenderer(accessToken: string): void {
    this.tilesRenderer = new TilesRenderer();
    this.tilesRenderer.registerPlugin(
      new CesiumIonAuthPlugin({
        apiToken: accessToken,
        assetId: SEVILLE_BUILDINGS_ASSET_ID,
        autoRefreshToken: true,
      })
    );
    this.tilesRenderer.setCamera(this.world.camera);
    this.tilesRenderer.setResolutionFromRenderer(
      this.world.camera,
      this.world.renderer
    );
    this.tilesRenderer.addEventListener("load-error", ({ error, url }) => {
      console.error("No se pudieron cargar los edificios de Cesium ion.", {
        error,
        url,
      });
      if (this.loadErrorShown) {
        return;
      }

      this.loadErrorShown = true;
      this.enabled = false;
      this.georeferencedGroup.visible = false;
      this.attributionElement.style.display = "none";
      this.restoreCamera();
      this.world.params.Seville_3D_Buildings = false;
      void Swal.fire({
        icon: "error",
        title: "No se pudo cargar Sevilla en 3D",
        text:
          "Comprueba el token de Cesium ion, sus permisos para el asset " +
          SEVILLE_BUILDINGS_ASSET_ID +
          " y la conexión a internet.",
        buttonsStyling: false,
      });
    });

    this.georeferencedGroup.add(this.tilesRenderer.group);
  }

  private focusSeville(): void {
    const cameraOperator = this.world.cameraOperator;
    this.cameraState = {
      target: cameraOperator.target.clone(),
      theta: cameraOperator.theta,
      phi: cameraOperator.phi,
      radius: cameraOperator.radius,
      targetRadius: cameraOperator.targetRadius,
      far: this.world.camera.far,
    };

    cameraOperator.target.set(0, 15, 0);
    cameraOperator.theta = 0;
    cameraOperator.phi = 32;
    cameraOperator.setRadius(350, true);
    this.world.camera.far = 10000;
    this.world.camera.updateProjectionMatrix();
    cameraOperator.update(0);
  }

  private restoreCamera(): void {
    if (!this.cameraState) {
      return;
    }

    const cameraOperator = this.world.cameraOperator;
    cameraOperator.target.copy(this.cameraState.target);
    cameraOperator.theta = this.cameraState.theta;
    cameraOperator.phi = this.cameraState.phi;
    cameraOperator.radius = this.cameraState.radius;
    cameraOperator.setRadius(this.cameraState.targetRadius, true);
    this.world.camera.far = this.cameraState.far;
    this.world.camera.updateProjectionMatrix();
    cameraOperator.update(0);
    this.cameraState = undefined;
  }

  private updateAttribution(): void {
    const attribution = this.tilesRenderer
      .getAttributions()
      .map((entry) =>
        typeof entry.value === "string"
          ? entry.value.replace(/<[^>]*>/g, "").trim()
          : ""
      )
      .filter((value) => value.length > 0)
      .join(" · ");
    this.attributionElement.textContent =
      attribution || "Cesium ion · OpenStreetMap contributors";
  }

  private createEcefToLocalMatrix(): THREE.Matrix4 {
    const longitude = THREE.MathUtils.degToRad(SEVILLE_LONGITUDE);
    const latitude = THREE.MathUtils.degToRad(SEVILLE_LATITUDE);
    const semiMajorAxis = 6378137;
    const eccentricitySquared = 6.69437999014e-3;
    const sinLatitude = Math.sin(latitude);
    const cosLatitude = Math.cos(latitude);
    const sinLongitude = Math.sin(longitude);
    const cosLongitude = Math.cos(longitude);
    const primeVerticalRadius =
      semiMajorAxis /
      Math.sqrt(1 - eccentricitySquared * sinLatitude * sinLatitude);
    const origin = new THREE.Vector3(
      primeVerticalRadius * cosLatitude * cosLongitude,
      primeVerticalRadius * cosLatitude * sinLongitude,
      primeVerticalRadius * (1 - eccentricitySquared) * sinLatitude
    );
    const east = new THREE.Vector3(-sinLongitude, cosLongitude, 0);
    const north = new THREE.Vector3(
      -sinLatitude * cosLongitude,
      -sinLatitude * sinLongitude,
      cosLatitude
    );
    const up = new THREE.Vector3(
      cosLatitude * cosLongitude,
      cosLatitude * sinLongitude,
      sinLatitude
    );
    const south = north.negate();

    return new THREE.Matrix4().set(
      east.x,
      east.y,
      east.z,
      -east.dot(origin),
      up.x,
      up.y,
      up.z,
      -up.dot(origin),
      south.x,
      south.y,
      south.z,
      -south.dot(origin),
      0,
      0,
      0,
      1
    );
  }
}
