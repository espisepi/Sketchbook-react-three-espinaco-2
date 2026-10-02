import * as CANNON from 'cannon';
import * as THREE from 'three';
import * as Utils from '../../core/FunctionLibrary';
import { ICollider } from '../../interfaces/ICollider';
import {Object3D} from 'three';

export class ConvexCollider implements ICollider
{
	public mesh: any;
	public options: any;
	public body: CANNON.Body;
	public debugModel: any;

	constructor(mesh: Object3D, options: any)
	{
		this.mesh = mesh.clone();

		let defaults = {
			mass: 0,
			position: mesh.position,
			friction: 0.3
		};
		options = Utils.setDefaults(options, defaults);
		this.options = options;

		let mat = new CANNON.Material('convMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		const geometry: THREE.BufferGeometry = this.mesh.geometry;
		const positions = geometry.getAttribute('position');
		if (!positions)
		{
			throw new Error('ConvexCollider requires geometry with a position attribute.');
		}

		const cannonPoints: CANNON.Vec3[] = [];
		for (let i = 0; i < positions.count; i++)
		{
			cannonPoints.push(new CANNON.Vec3(positions.getX(i), positions.getY(i), positions.getZ(i)));
		}

		const indices = geometry.index;
		const cannonFaces: number[][] = [];
		const indexCount = indices ? indices.count : positions.count;
		for (let i = 0; i + 2 < indexCount; i += 3)
		{
			cannonFaces.push([
				indices ? indices.getX(i) : i,
				indices ? indices.getX(i + 1) : i + 1,
				indices ? indices.getX(i + 2) : i + 2
			]);
		}

		const shape = new CANNON.ConvexPolyhedron(cannonPoints);
		shape.faces = cannonFaces;
		shape.computeNormals();
		// shape.material = mat;

		// Add phys sphere
		let physBox = new CANNON.Body({
			mass: options.mass,
			position: options.position,
			shape
		});

		physBox.material = mat;

		this.body = physBox;
	}
}