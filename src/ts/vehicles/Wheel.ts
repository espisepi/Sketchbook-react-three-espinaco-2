import { WheelInfo } from 'cannon';
import { Object3D, Vector3 } from 'three';

export class Wheel
{
	public wheelObject: Object3D;
	public position: Vector3;
	public steering: boolean = false;
	public drive: string; // Drive type "fwd" or "rwd"
	public rayCastWheelInfoIndex: number; // Linked to a raycast vehicle WheelInfo structure

	constructor(wheelObject: Object3D)
	{
		this.wheelObject = wheelObject;

		this.position = wheelObject.position;

		if (wheelObject.hasOwnProperty('userData') && wheelObject.userData.hasOwnProperty('data'))
		{
			if (wheelObject.userData.hasOwnProperty('steering')) 
			{
				this.steering = (wheelObject.userData.steering === 'true');
			}

			if (wheelObject.userData.hasOwnProperty('drive')) 
			{
				this.drive = wheelObject.userData.drive;
			}
		}
	}
}