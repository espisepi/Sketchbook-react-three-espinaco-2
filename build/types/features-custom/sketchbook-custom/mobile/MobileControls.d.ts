/**
 * MobileControls - On-screen game controls overlay
 *
 * Provides two virtual joysticks (movement + camera) and contextual
 * action buttons that adapt to the current control mode (character,
 * car, airplane, helicopter, free camera).
 *
 * Works on both desktop (mouse) and mobile (touch).
 * Can be toggled on/off with a persistent button.
 *
 * Movement joystick → dispatches synthetic WASD KeyboardEvents
 * Camera joystick   → directly calls cameraOperator.move()
 * Action buttons    → dispatch synthetic KeyboardEvents
 *
 * No external libraries used - pure HTML/CSS/TS.
 */
import { World } from '../../../ts/world/World';
interface ControlInfo {
    desc: string;
    keys: string[];
}
export declare class MobileControls {
    private world;
    private container;
    private initialized;
    private visible;
    private moveJoy;
    private camJoy;
    private btnContainer;
    private activeBtns;
    private topBar;
    private toggleBtn;
    private speedSlider;
    private speedValue;
    private moveState;
    private camKeyState;
    private boundCamKeyDown;
    private boundCamKeyUp;
    private static readonly DEAD_ZONE;
    private camSpeed;
    private static readonly CAM_SPEED_MIN;
    private static readonly CAM_SPEED_MAX;
    private static readonly CAM_SPEED_STEP;
    constructor(world: World);
    private init;
    private createOverlay;
    private createTopBar;
    toggle(): void;
    show(): void;
    hide(): void;
    update(): void;
    /**
     * Convert movement joystick position into WASD key events.
     * Only dispatches when a direction state actually changes.
     */
    private processMovement;
    private toggleMoveKey;
    /**
     * Convert camera inputs into camera rotation.
     * Combines the right joystick (when visible) and IJKL keyboard (always).
     * Directly calls cameraOperator.move() for smooth control.
     */
    private processCamera;
    private onCameraKeyDown;
    private onCameraKeyUp;
    private emitKey;
    /**
     * Called when the active entity changes (character ↔ vehicle ↔ camera).
     * Detects the new mode and rebuilds action buttons accordingly.
     */
    onControlsUpdated(controls: ControlInfo[]): void;
    private releaseAllMoveKeys;
    /**
     * Detect current control mode from the control descriptions.
     * Each mode has a unique descriptor string.
     */
    private detectMode;
    private buildButtons;
    /**
     * Returns button layout for a given mode.
     * Each sub-array is a row. First row = primary (displayed at bottom),
     * last row = utility (displayed at top).
     */
    private getLayout;
    dispose(): void;
    private injectStyles;
}
export {};
