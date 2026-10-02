import { SkyShader } from '../../lib/shaders/SkyShader';
import * as THREE from 'three';
import { World } from './World';
import { EntityType } from '../enums/EntityType';
import { IUpdatable } from '../interfaces/IUpdatable';
// import { default as CSM } from 'three-csm';

export class Sky extends THREE.Object3D implements IUpdatable
{
	public updateOrder: number = 5;

	public sunPosition: THREE.Vector3 = new THREE.Vector3();
	public sunLight: THREE.DirectionalLight;
	// public csm: CSM;

	set theta(value: number) {
		this._theta = value;
		this.refreshSunPosition();
	}

	set phi(value: number) {
		this._phi = value;
		this.refreshSunPosition();
		this.refreshHemiIntensity();
	}

	private _phi: number = 50;
	private _theta: number = 145;

	private hemiLight: THREE.HemisphereLight;

	private maxHemiIntensity: number = 0.9;
	private minHemiIntensity: number = 0.3;

	private skyMesh: THREE.Mesh;
	private skyMaterial: THREE.ShaderMaterial;

	private world: World;

	constructor(world: World)
	{
		super();

		this.world = world;
		
		// Sky material
		this.skyMaterial = new THREE.ShaderMaterial({
			uniforms: THREE.UniformsUtils.clone(SkyShader.uniforms),
			fragmentShader: SkyShader.fragmentShader,
			vertexShader: SkyShader.vertexShader,
			side: THREE.BackSide
		});

		// Mesh
		this.skyMesh = new THREE.Mesh(
			new THREE.SphereGeometry(1000, 24, 12),
			this.skyMaterial
		);
		this.attach(this.skyMesh);

		// Ambient light
		this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.0 );
		this.refreshHemiIntensity();
		this.hemiLight.color.setHSL( 0.59, 0.4, 0.6 );
		this.hemiLight.groundColor.setHSL( 0.095, 0.2, 0.75 );
		this.hemiLight.position.set( 0, 50, 0 );
		this.world.graphicsWorld.add( this.hemiLight );

		// three-csm patches Three.js shader chunks that changed in newer releases.
		// Keep this legacy setup disabled until it is updated for current Three.js.
		// let splitsCallback = (amount, near, far) =>
		// {
		// 	let splits = [];
		// 	for (let i = amount - 1; i >= 0; i--)
		// 	{
		// 		splits.push(Math.pow(1 / 4, i));
		// 	}
		// 	return splits;
		// };
		// this.csm = new CSM({
		// 	maxFar: 250,
		// 	lightIntensity: 2.5,
		// 	cascades: 3,
		// 	shadowMapSize: 2048,
		// 	camera: world.camera,
		// 	parent: world.graphicsWorld,
		// 	mode: 'custom',
		// 	customSplitsCallback: splitsCallback
		// });
		// this.csm.fade = true;

		this.sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
		this.sunLight.position.copy(this.sunPosition).multiplyScalar(100);
		this.sunLight.castShadow = true;
		this.sunLight.shadow.mapSize.set(2048, 2048);
		this.sunLight.shadow.camera.left = -250;
		this.sunLight.shadow.camera.right = 250;
		this.sunLight.shadow.camera.top = 250;
		this.sunLight.shadow.camera.bottom = -250;
		this.sunLight.shadow.camera.far = 600;
		this.sunLight.shadow.camera.updateProjectionMatrix();
		world.graphicsWorld.add(this.sunLight);

		this.refreshSunPosition();
		
		world.graphicsWorld.add(this);
		world.registerUpdatable(this);
	}

	public update(timeScale: number): void
	{
		this.position.copy(this.world.camera.position);
		this.refreshSunPosition();

		this.sunLight.position.copy(this.sunPosition).multiplyScalar(100);
		// this.csm.lightDirection = new THREE.Vector3(-this.sunPosition.x, -this.sunPosition.y, -this.sunPosition.z).normalize();
		// this.csm.update();
	}

	public refreshSunPosition(): void
	{
		const sunDistance = 10;

		this.sunPosition.x = sunDistance * Math.sin(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);
		this.sunPosition.y = sunDistance * Math.sin(this._phi * Math.PI / 180);
		this.sunPosition.z = sunDistance * Math.cos(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);

		this.skyMaterial.uniforms.sunPosition.value.copy(this.sunPosition);
		this.skyMaterial.uniforms.cameraPos.value.copy(this.world.camera.position);
	}

	public refreshHemiIntensity(): void
	{
		this.hemiLight.intensity = this.minHemiIntensity + Math.pow(1 - (Math.abs(this._phi - 90) / 90), 0.25) * (this.maxHemiIntensity - this.minHemiIntensity);
	}
}