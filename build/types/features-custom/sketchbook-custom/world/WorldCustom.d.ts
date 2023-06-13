import { World } from '../../../ts/sketchbook';
interface Control {
    desc: String;
    keys: Array<String>;
}
export declare class WorldCustom extends World {
    constructor(worldScenePath?: any);
    updateControls(controls: Array<Control>): void;
    private renderUIMobileButtons;
    private renderMovementButtons;
    private renderMovementButtonUp;
    private renderMovementButtonDown;
    private renderMovementButtonLeft;
    private renderMovementButtonRight;
}
export {};
