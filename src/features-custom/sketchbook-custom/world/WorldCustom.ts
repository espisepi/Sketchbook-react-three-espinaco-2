import { World } from '../../../ts/sketchbook';
import { MobileControls } from '../mobile/MobileControls';

interface Control {
	desc: string;
	keys: string[];
}

export class WorldCustom extends World {
	private mobileControls: MobileControls;

	constructor(worldScenePath?: any) {
		super(worldScenePath);
		this.mobileControls = new MobileControls(this);
	}

	/**
	 * Called whenever the active entity changes (character ↔ vehicle ↔ camera).
	 * Forwards the control descriptors to mobile controls so buttons can adapt.
	 */
	public updateControls(controls: Array<Control>): void {
		super.updateControls(controls);

		if (this.mobileControls) {
			this.mobileControls.onControlsUpdated(controls);
		}
	}

	/**
	 * Main update loop. Processes mobile joystick inputs each frame.
	 */
	public update(timeStep: number, unscaledTimeStep: number): void {
		super.update(timeStep, unscaledTimeStep);

		if (this.mobileControls) {
			this.mobileControls.update();
		}
	}
}
