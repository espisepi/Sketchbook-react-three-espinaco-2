import { World } from '../../../ts/sketchbook';
interface Control {
    desc: string;
    keys: string[];
}
export declare class WorldCustom extends World {
    private mobileControls;
    constructor(worldScenePath?: any);
    /**
     * Called whenever the active entity changes (character ↔ vehicle ↔ camera).
     * Forwards the control descriptors to mobile controls so buttons can adapt.
     */
    updateControls(controls: Array<Control>): void;
    /**
     * Main update loop. Processes mobile joystick inputs each frame.
     */
    update(timeStep: number, unscaledTimeStep: number): void;
}
export {};
