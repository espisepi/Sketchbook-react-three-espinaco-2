import { World } from "../../../ts/sketchbook";
import { VideoPoints } from "../prefabs/videopoints/VideoPoints";
interface Control {
    desc: String;
    keys: Array<String>;
}
interface JoystickState {
    joystick: any;
    isMove: boolean;
    velocityMove: number;
    position: Position;
}
interface Position {
    x: number;
    y: number;
}
export declare class WorldCustom extends World {
    joystickState: JoystickState;
    videoPoints: VideoPoints;
    constructor(worldScenePath?: any);
    addObjectsInScene(): void;
    updateControls(controls: Array<Control>): void;
    private renderUIMobileButtons;
    private renderMovementButtons;
    private renderMovementButtonUp;
    private renderMovementButtonDown;
    private renderMovementButtonLeft;
    private renderMovementButtonRight;
    private renderJoystickCameraMovement;
    update(timeStep: number, unscaledTimeStep: number): void;
}
export {};
