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

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

interface ControlInfo {
	desc: string;
	keys: string[];
}

interface ButtonDef {
	id: string;
	label: string;
	ariaLabel: string;
	code: string;
	key: string;
	shiftKey: boolean;
	size: string; // 'lg' | 'md' | 'sm'
}

// ─────────────────────────────────────────────
// MobileControls (main orchestrator)
// ─────────────────────────────────────────────

export class MobileControls
{
	private world: World;
	private container: HTMLDivElement;
	private initialized: boolean = false;
	private visible: boolean = true;

	// Joysticks
	private moveJoy: VirtualJoystick;
	private camJoy: VirtualJoystick;

	// Action buttons
	private btnContainer: HTMLDivElement;
	private activeBtns: TouchButton[] = [];

	// Toggle button
	private toggleBtn: HTMLButtonElement;

	// Movement key state tracking (prevents duplicate dispatches)
	private moveState: { up: boolean; down: boolean; left: boolean; right: boolean } = {
		up: false, down: false, left: false, right: false
	};

	// Configuration
	private static readonly DEAD_ZONE: number = 0.15;
	private static readonly CAM_SPEED: number = 5;

	constructor(world: World)
	{
		this.world = world;
		this.init();
	}

	// ── Initialization ─────────────────────

	private init(): void
	{
		this.injectStyles();
		this.createOverlay();
		this.initialized = true;
	}

	private createOverlay(): void
	{
		// Main overlay (covers entire screen, pointer-events pass through)
		this.container = document.createElement('div');
		this.container.id = 'mc-overlay';
		this.container.setAttribute('role', 'region');
		this.container.setAttribute('aria-label', 'On-screen game controls');
		document.body.appendChild(this.container);

		// Movement joystick (left side)
		this.moveJoy = new VirtualJoystick(this.container, 'left', 'Movement joystick');

		// Camera joystick (right side)
		this.camJoy = new VirtualJoystick(this.container, 'right', 'Camera joystick');

		// Button container (above camera joystick)
		this.btnContainer = document.createElement('div');
		this.btnContainer.className = 'mc-actions';
		this.btnContainer.setAttribute('role', 'toolbar');
		this.btnContainer.setAttribute('aria-label', 'Action buttons');
		this.container.appendChild(this.btnContainer);

		// Toggle button (always visible)
		this.createToggleButton();
	}

	// ── Toggle visibility ──────────────────

	private createToggleButton(): void
	{
		this.toggleBtn = document.createElement('button');
		this.toggleBtn.className = 'mc-toggle';
		this.toggleBtn.setAttribute('aria-label', 'Toggle on-screen controls');
		this.toggleBtn.setAttribute('aria-expanded', 'true');
		this.toggleBtn.title = 'Toggle on-screen controls';

		// Gamepad SVG icon
		this.toggleBtn.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
				'<rect x="2" y="6" width="20" height="12" rx="4"/>' +
				'<line x1="8" y1="10" x2="8" y2="14"/>' +
				'<line x1="6" y1="12" x2="10" y2="12"/>' +
				'<circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>' +
				'<circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>' +
			'</svg>';

		this.toggleBtn.addEventListener('click', () => { this.toggle(); });
		this.container.appendChild(this.toggleBtn);
	}

	public toggle(): void
	{
		if (this.visible)
		{
			this.hide();
		}
		else
		{
			this.show();
		}
	}

	public show(): void
	{
		this.visible = true;
		this.container.classList.remove('mc-overlay--hidden');
		this.toggleBtn.setAttribute('aria-expanded', 'true');
		this.toggleBtn.setAttribute('aria-label', 'Hide on-screen controls');
	}

	public hide(): void
	{
		this.visible = false;
		this.container.classList.add('mc-overlay--hidden');
		this.toggleBtn.setAttribute('aria-expanded', 'false');
		this.toggleBtn.setAttribute('aria-label', 'Show on-screen controls');

		// Release any active inputs to prevent stuck keys
		this.releaseAllMoveKeys();
		this.moveJoy.reset();
		this.camJoy.reset();

		for (let i = 0; i < this.activeBtns.length; i++)
		{
			this.activeBtns[i].forceRelease();
		}
	}

	// ── Frame update (called every frame) ──

	public update(): void
	{
		if (!this.initialized || !this.visible) return;
		this.processMovement();
		this.processCamera();
	}

	/**
	 * Convert movement joystick position into WASD key events.
	 * Only dispatches when a direction state actually changes.
	 */
	private processMovement(): void
	{
		const anyKeyActive = this.moveState.up || this.moveState.down || this.moveState.left || this.moveState.right;
		if (!this.moveJoy.isActive && !anyKeyActive) return;

		const x = this.moveJoy.x;
		const y = this.moveJoy.y;
		const dz = MobileControls.DEAD_ZONE;

		this.toggleMoveKey('up',    y > dz,  'KeyW', 'w');
		this.toggleMoveKey('down',  y < -dz, 'KeyS', 's');
		this.toggleMoveKey('left',  x < -dz, 'KeyA', 'a');
		this.toggleMoveKey('right', x > dz,  'KeyD', 'd');
	}

	private toggleMoveKey(dir: string, shouldBeActive: boolean, code: string, key: string): void
	{
		if ((this.moveState as any)[dir] !== shouldBeActive)
		{
			(this.moveState as any)[dir] = shouldBeActive;
			this.emitKey(code, key, shouldBeActive);
		}
	}

	/**
	 * Convert camera joystick position into camera rotation.
	 * Directly calls cameraOperator.move() for smooth control.
	 */
	private processCamera(): void
	{
		if (!this.camJoy.isActive) return;
		if (!this.world.cameraOperator) return;

		this.world.cameraOperator.move(
			this.camJoy.x * MobileControls.CAM_SPEED,
			this.camJoy.y * MobileControls.CAM_SPEED
		);
	}

	// ── Key event dispatch ─────────────────

	private emitKey(code: string, key: string, down: boolean, shiftKey: boolean = false): void
	{
		document.dispatchEvent(new KeyboardEvent(
			down ? 'keydown' : 'keyup',
			{ code: code, key: key, shiftKey: shiftKey, bubbles: true, cancelable: true }
		));
	}

	// ── Context switching (controls changed) ──

	/**
	 * Called when the active entity changes (character ↔ vehicle ↔ camera).
	 * Detects the new mode and rebuilds action buttons accordingly.
	 */
	public onControlsUpdated(controls: ControlInfo[]): void
	{
		if (!this.initialized) return;

		// Release all movement keys to prevent stuck inputs during transitions
		this.releaseAllMoveKeys();

		const mode = this.detectMode(controls);
		this.buildButtons(mode);
	}

	private releaseAllMoveKeys(): void
	{
		if (this.moveState.up)    { this.moveState.up = false;    this.emitKey('KeyW', 'w', false); }
		if (this.moveState.down)  { this.moveState.down = false;  this.emitKey('KeyS', 's', false); }
		if (this.moveState.left)  { this.moveState.left = false;  this.emitKey('KeyA', 'a', false); }
		if (this.moveState.right) { this.moveState.right = false; this.emitKey('KeyD', 'd', false); }
	}

	/**
	 * Detect current control mode from the control descriptions.
	 * Each mode has a unique descriptor string.
	 */
	private detectMode(controls: ControlInfo[]): string
	{
		for (let i = 0; i < controls.length; i++)
		{
			const desc = controls[i].desc;
			if (desc === 'Jump') return 'character';
			if (desc === 'Handbrake') return 'car';
			if (desc === 'Elevators') return 'airplane';
			if (desc === 'Ascend') return 'helicopter';
			if (desc === 'Exit free camera mode') return 'camera';
		}
		return 'character';
	}

	// ── Button management ──────────────────

	private buildButtons(mode: string): void
	{
		// Destroy existing buttons (also releases any held keys)
		for (let i = 0; i < this.activeBtns.length; i++)
		{
			this.activeBtns[i].destroy();
		}
		this.activeBtns = [];
		this.btnContainer.innerHTML = '';

		// Get layout for current mode
		const rows = this.getLayout(mode);

		// Build rows (column-reverse in CSS: first row = bottom/closest to thumb)
		for (let r = 0; r < rows.length; r++)
		{
			const rowDiv = document.createElement('div');
			rowDiv.className = 'mc-action-row';
			rowDiv.setAttribute('role', 'group');
			rowDiv.setAttribute('aria-label', r === 0 ? 'Primary actions' : (r === 1 ? 'Secondary actions' : 'Utility actions'));

			for (let b = 0; b < rows[r].length; b++)
			{
				const def = rows[r][b];
				const btn = new TouchButton(def, (code: string, key: string, down: boolean, shift: boolean) => {
					this.emitKey(code, key, down, shift);
				});
				this.activeBtns.push(btn);
				rowDiv.appendChild(btn.el);
			}

			this.btnContainer.appendChild(rowDiv);
		}
	}

	/**
	 * Returns button layout for a given mode.
	 * Each sub-array is a row. First row = primary (displayed at bottom),
	 * last row = utility (displayed at top).
	 */
	private getLayout(mode: string): ButtonDef[][]
	{
		switch (mode)
		{
			case 'character':
				return [
					// Row 0 – Primary (bottom, closest to thumb)
					[
						{ id: 'jump',  label: 'JUMP', ariaLabel: 'Jump (Space)',               code: 'Space',     key: ' ',     shiftKey: false, size: 'lg' },
						{ id: 'run',   label: 'RUN',  ariaLabel: 'Sprint (Shift)',              code: 'ShiftLeft', key: 'Shift', shiftKey: false, size: 'lg' },
					],
					// Row 1 – Secondary
					[
						{ id: 'use',   label: 'E', ariaLabel: 'Interact (E)',                  code: 'KeyE', key: 'e', shiftKey: false, size: 'md' },
						{ id: 'enter', label: 'F', ariaLabel: 'Enter vehicle as driver (F)',    code: 'KeyF', key: 'f', shiftKey: false, size: 'md' },
						{ id: 'pass',  label: 'G', ariaLabel: 'Enter vehicle as passenger (G)', code: 'KeyG', key: 'g', shiftKey: false, size: 'md' },
					],
					// Row 2 – Utility (top)
					[
						{ id: 'respawn', label: '↻', ariaLabel: 'Respawn (Shift+R)', code: 'KeyR', key: 'r', shiftKey: true, size: 'sm' },
					],
				];

			case 'car':
				return [
					[
						{ id: 'brake', label: 'BRAKE', ariaLabel: 'Handbrake (Space)',       code: 'Space', key: ' ',  shiftKey: false, size: 'lg' },
						{ id: 'exit',  label: 'EXIT',  ariaLabel: 'Exit vehicle (F)',         code: 'KeyF',  key: 'f',  shiftKey: false, size: 'lg' },
					],
					[
						{ id: 'view', label: 'V', ariaLabel: 'Toggle view (V)',              code: 'KeyV', key: 'v', shiftKey: false, size: 'md' },
						{ id: 'seat', label: 'X', ariaLabel: 'Switch seat (X)',              code: 'KeyX', key: 'x', shiftKey: false, size: 'md' },
					],
					[
						{ id: 'respawn', label: '↻', ariaLabel: 'Respawn (Shift+R)',        code: 'KeyR', key: 'r', shiftKey: true, size: 'sm' },
					],
				];

			case 'airplane':
				return [
					[
						{ id: 'throttle', label: 'ACC', ariaLabel: 'Accelerate (Shift)',     code: 'ShiftLeft', key: 'Shift', shiftKey: false, size: 'lg' },
						{ id: 'brake',    label: 'BRK', ariaLabel: 'Decelerate (Space)',     code: 'Space',     key: ' ',     shiftKey: false, size: 'lg' },
					],
					[
						{ id: 'yawL', label: '←',  ariaLabel: 'Yaw left (Q)',               code: 'KeyQ', key: 'q', shiftKey: false, size: 'md' },
						{ id: 'yawR', label: '→',  ariaLabel: 'Yaw right (E)',              code: 'KeyE', key: 'e', shiftKey: false, size: 'md' },
						{ id: 'wbrk', label: 'B',  ariaLabel: 'Wheel brake (B)',            code: 'KeyB', key: 'b', shiftKey: false, size: 'md' },
					],
					[
						{ id: 'exit',    label: 'EXIT', ariaLabel: 'Exit vehicle (F)',       code: 'KeyF', key: 'f', shiftKey: false, size: 'sm' },
						{ id: 'view',    label: 'V',    ariaLabel: 'Toggle view (V)',        code: 'KeyV', key: 'v', shiftKey: false, size: 'sm' },
						{ id: 'respawn', label: '↻',    ariaLabel: 'Respawn (Shift+R)',      code: 'KeyR', key: 'r', shiftKey: true,  size: 'sm' },
					],
				];

			case 'helicopter':
				return [
					[
						{ id: 'ascend',  label: 'UP',   ariaLabel: 'Ascend (Shift)',        code: 'ShiftLeft', key: 'Shift', shiftKey: false, size: 'lg' },
						{ id: 'descend', label: 'DOWN', ariaLabel: 'Descend (Space)',        code: 'Space',     key: ' ',     shiftKey: false, size: 'lg' },
					],
					[
						{ id: 'yawL', label: '←', ariaLabel: 'Yaw left (Q)',                code: 'KeyQ', key: 'q', shiftKey: false, size: 'md' },
						{ id: 'yawR', label: '→', ariaLabel: 'Yaw right (E)',               code: 'KeyE', key: 'e', shiftKey: false, size: 'md' },
					],
					[
						{ id: 'exit',    label: 'EXIT', ariaLabel: 'Exit vehicle (F)',       code: 'KeyF', key: 'f', shiftKey: false, size: 'sm' },
						{ id: 'view',    label: 'V',    ariaLabel: 'Toggle view (V)',        code: 'KeyV', key: 'v', shiftKey: false, size: 'sm' },
						{ id: 'respawn', label: '↻',    ariaLabel: 'Respawn (Shift+R)',      code: 'KeyR', key: 'r', shiftKey: true,  size: 'sm' },
					],
				];

			case 'camera':
				return [
					[
						{ id: 'fast', label: 'FAST', ariaLabel: 'Speed up (Shift)',         code: 'ShiftLeft', key: 'Shift', shiftKey: false, size: 'lg' },
					],
					[
						{ id: 'up',   label: 'E', ariaLabel: 'Move up (E)',                 code: 'KeyE', key: 'e', shiftKey: false, size: 'md' },
						{ id: 'down', label: 'Q', ariaLabel: 'Move down (Q)',               code: 'KeyQ', key: 'q', shiftKey: false, size: 'md' },
					],
					[
						{ id: 'exitCam', label: 'CAM', ariaLabel: 'Exit free camera (Shift+C)', code: 'KeyC', key: 'c', shiftKey: true, size: 'sm' },
					],
				];

			default:
				return [];
		}
	}

	// ── Cleanup ────────────────────────────

	public dispose(): void
	{
		if (!this.initialized) return;
		this.releaseAllMoveKeys();
		this.moveJoy.destroy();
		this.camJoy.destroy();
		for (let i = 0; i < this.activeBtns.length; i++)
		{
			this.activeBtns[i].destroy();
		}
		this.container.remove();
		this.initialized = false;
	}

	// ── CSS injection ──────────────────────

	private injectStyles(): void
	{
		if (document.getElementById('mc-styles')) return;

		const style = document.createElement('style');
		style.id = 'mc-styles';
		style.textContent = `

/* ======================================= */
/* On-Screen Controls – Injected Styles    */
/* ======================================= */

#mc-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 100;
	overflow: hidden;
}

#mc-overlay * {
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: transparent;
}

/* ── Toggle Button ───────────────────── */

.mc-toggle {
	position: absolute;
	top: 10px;
	left: 50%;
	transform: translateX(-50%);
	width: 42px;
	height: 42px;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.35);
	border: 2px solid rgba(255, 255, 255, 0.18);
	color: #fff;
	cursor: pointer;
	pointer-events: auto;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background 0.15s, border-color 0.15s, transform 0.15s;
	outline: none;
	-webkit-appearance: none;
	appearance: none;
	z-index: 110;
	padding: 0;
}

.mc-toggle:hover {
	background: rgba(0, 0, 0, 0.50);
	border-color: rgba(255, 255, 255, 0.35);
}

.mc-toggle:focus-visible {
	outline: 2px solid #5bf;
	outline-offset: 2px;
}

.mc-toggle svg {
	pointer-events: none;
}

/* When controls are hidden, dim the toggle icon */
.mc-overlay--hidden .mc-toggle {
	opacity: 0.55;
}

.mc-overlay--hidden .mc-toggle:hover {
	opacity: 1;
}

/* ── Hidden state (hides joysticks + actions) ── */

#mc-overlay .mc-joy,
#mc-overlay .mc-actions {
	transition: opacity 0.2s ease;
}

.mc-overlay--hidden .mc-joy,
.mc-overlay--hidden .mc-actions {
	opacity: 0;
	pointer-events: none !important;
}

/* ── Joystick ────────────────────────── */

.mc-joy {
	position: absolute;
	width: 140px;
	height: 140px;
	pointer-events: auto;
	touch-action: none;
	-webkit-user-select: none;
	user-select: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.mc-joy--left {
	bottom: 18px;
	left: 14px;
}

.mc-joy--right {
	bottom: 18px;
	right: 14px;
}

.mc-joy__base {
	width: 120px;
	height: 120px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.07);
	border: 2px solid rgba(255, 255, 255, 0.14);
	position: relative;
	transition: background 0.15s, border-color 0.15s;
}

.mc-joy__base--active {
	background: rgba(255, 255, 255, 0.12);
	border-color: rgba(255, 255, 255, 0.28);
}

.mc-joy__knob {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: radial-gradient(circle at 38% 32%,
		rgba(255, 255, 255, 0.38),
		rgba(255, 255, 255, 0.14));
	border: 2px solid rgba(255, 255, 255, 0.30);
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
	will-change: transform;
}

/* ── Action Buttons Container ────────── */

.mc-actions {
	position: absolute;
	right: 8px;
	bottom: 168px;
	display: flex;
	flex-direction: column-reverse;
	gap: 9px;
	align-items: flex-end;
	pointer-events: none;
}

.mc-action-row {
	display: flex;
	gap: 9px;
	pointer-events: none;
}

/* ── Buttons ─────────────────────────── */

.mc-btn {
	pointer-events: auto;
	touch-action: none;
	-webkit-user-select: none;
	user-select: none;
	border: none;
	border-radius: 50%;
	color: #fff;
	font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
	font-weight: 700;
	letter-spacing: 0.5px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);
	transition: transform 0.08s ease, background-color 0.08s ease;
	outline: none;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.30);
	-webkit-appearance: none;
	appearance: none;
}

.mc-btn:focus-visible {
	outline: 2px solid #5bf;
	outline-offset: 2px;
}

.mc-btn--lg {
	width: 62px;
	height: 62px;
	font-size: 11px;
	background: rgba(255, 255, 255, 0.16);
	border: 2px solid rgba(255, 255, 255, 0.26);
}

.mc-btn--md {
	width: 50px;
	height: 50px;
	font-size: 13px;
	background: rgba(255, 255, 255, 0.12);
	border: 2px solid rgba(255, 255, 255, 0.20);
}

.mc-btn--sm {
	width: 42px;
	height: 42px;
	font-size: 13px;
	background: rgba(255, 255, 255, 0.09);
	border: 2px solid rgba(255, 255, 255, 0.16);
}

.mc-btn--pressed {
	transform: scale(0.87);
	background: rgba(255, 255, 255, 0.36) !important;
	border-color: rgba(255, 255, 255, 0.50) !important;
}

`;
		document.head.appendChild(style);
	}
}


// ─────────────────────────────────────────────
// VirtualJoystick (supports both touch and mouse)
// ─────────────────────────────────────────────

class VirtualJoystick
{
	/** Normalized X value (-1 to 1, right is positive) */
	public x: number = 0;
	/** Normalized Y value (-1 to 1, up is positive) */
	public y: number = 0;
	/** Whether a finger/mouse is currently on the joystick */
	public isActive: boolean = false;

	private el: HTMLDivElement;
	private base: HTMLDivElement;
	private knob: HTMLDivElement;

	// Touch tracking
	private touchId: number = -1;

	// Mouse tracking
	private mouseActive: boolean = false;

	private cachedRect: ClientRect | null = null;

	/**
	 * Maximum pixel distance the knob can travel from center.
	 * Calculated as (baseRadius - knobRadius) = (60 - 24) = 36
	 */
	private readonly maxDist: number = 36;

	// Bound handlers for cleanup
	private boundTouchMove: (e: TouchEvent) => void;
	private boundTouchEnd: (e: TouchEvent) => void;
	private boundMouseMove: (e: MouseEvent) => void;
	private boundMouseUp: (e: MouseEvent) => void;

	constructor(parent: HTMLElement, side: 'left' | 'right', label: string)
	{
		// Build DOM
		this.el = document.createElement('div');
		this.el.className = 'mc-joy mc-joy--' + side;
		this.el.setAttribute('role', 'application');
		this.el.setAttribute('aria-label', label);
		this.el.setAttribute('aria-roledescription', 'joystick');
		this.el.setAttribute('tabindex', '-1');

		this.base = document.createElement('div');
		this.base.className = 'mc-joy__base';
		this.base.setAttribute('aria-hidden', 'true');
		this.el.appendChild(this.base);

		this.knob = document.createElement('div');
		this.knob.className = 'mc-joy__knob';
		this.knob.setAttribute('aria-hidden', 'true');
		this.base.appendChild(this.knob);

		parent.appendChild(this.el);

		// Bind event handlers
		this.boundTouchMove = this.onTouchMove.bind(this);
		this.boundTouchEnd = this.onTouchEnd.bind(this);
		this.boundMouseMove = this.onMouseMove.bind(this);
		this.boundMouseUp = this.onMouseUp.bind(this);

		// Touch events
		this.el.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
		document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
		document.addEventListener('touchend', this.boundTouchEnd);
		document.addEventListener('touchcancel', this.boundTouchEnd);

		// Mouse events (for desktop support)
		this.el.addEventListener('mousedown', this.onMouseDown.bind(this));
	}

	// ── Touch handlers ───────────────────

	private onTouchStart(e: TouchEvent): void
	{
		e.preventDefault();
		if (this.isActive) return;

		const touch = e.changedTouches[0];
		this.touchId = touch.identifier;
		this.activate();
		this.processInput(touch.clientX, touch.clientY);
	}

	private onTouchMove(e: TouchEvent): void
	{
		if (!this.isActive || this.mouseActive) return;

		for (let i = 0; i < e.changedTouches.length; i++)
		{
			if (e.changedTouches[i].identifier === this.touchId)
			{
				e.preventDefault();
				this.processInput(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
				return;
			}
		}
	}

	private onTouchEnd(e: TouchEvent): void
	{
		if (!this.isActive || this.mouseActive) return;

		for (let i = 0; i < e.changedTouches.length; i++)
		{
			if (e.changedTouches[i].identifier === this.touchId)
			{
				this.reset();
				return;
			}
		}
	}

	// ── Mouse handlers (desktop) ─────────

	private onMouseDown(e: MouseEvent): void
	{
		e.preventDefault();
		e.stopPropagation();
		if (this.isActive) return;

		this.mouseActive = true;
		this.activate();
		this.processInput(e.clientX, e.clientY);

		document.addEventListener('mousemove', this.boundMouseMove);
		document.addEventListener('mouseup', this.boundMouseUp);
	}

	private onMouseMove(e: MouseEvent): void
	{
		if (!this.mouseActive) return;
		e.preventDefault();
		this.processInput(e.clientX, e.clientY);
	}

	private onMouseUp(e: MouseEvent): void
	{
		if (!this.mouseActive) return;
		this.mouseActive = false;
		document.removeEventListener('mousemove', this.boundMouseMove);
		document.removeEventListener('mouseup', this.boundMouseUp);
		this.reset();
	}

	// ── Shared logic ─────────────────────

	private activate(): void
	{
		this.isActive = true;
		this.base.classList.add('mc-joy__base--active');
		this.cachedRect = this.base.getBoundingClientRect();
	}

	/**
	 * Update joystick state from a pointer position (touch or mouse).
	 * Clamps to the max radius and normalizes to -1..1.
	 */
	private processInput(clientX: number, clientY: number): void
	{
		if (!this.cachedRect) return;

		const centerX = this.cachedRect.left + this.cachedRect.width / 2;
		const centerY = this.cachedRect.top + this.cachedRect.height / 2;

		let dx = clientX - centerX;
		let dy = clientY - centerY;
		const dist = Math.sqrt(dx * dx + dy * dy);

		// Clamp to max radius
		if (dist > this.maxDist)
		{
			dx = (dx / dist) * this.maxDist;
			dy = (dy / dist) * this.maxDist;
		}

		// Normalized values (Y inverted: screen-down = negative, screen-up = positive)
		this.x = dx / this.maxDist;
		this.y = -(dy / this.maxDist);

		// Move knob visually
		this.knob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
	}

	public reset(): void
	{
		this.isActive = false;
		this.touchId = -1;
		this.x = 0;
		this.y = 0;
		this.cachedRect = null;
		this.knob.style.transform = 'translate(-50%, -50%)';
		this.base.classList.remove('mc-joy__base--active');
	}

	public destroy(): void
	{
		document.removeEventListener('touchmove', this.boundTouchMove);
		document.removeEventListener('touchend', this.boundTouchEnd);
		document.removeEventListener('touchcancel', this.boundTouchEnd);
		document.removeEventListener('mousemove', this.boundMouseMove);
		document.removeEventListener('mouseup', this.boundMouseUp);
		this.el.remove();
	}
}


// ─────────────────────────────────────────────
// TouchButton (with accessibility)
// ─────────────────────────────────────────────

class TouchButton
{
	public el: HTMLButtonElement;

	private def: ButtonDef;
	private pressed: boolean = false;
	private emitFn: (code: string, key: string, down: boolean, shiftKey: boolean) => void;

	constructor(
		def: ButtonDef,
		emitFn: (code: string, key: string, down: boolean, shiftKey: boolean) => void
	)
	{
		this.def = def;
		this.emitFn = emitFn;

		// Create button element
		this.el = document.createElement('button');
		this.el.className = 'mc-btn mc-btn--' + def.size;
		this.el.textContent = def.label;
		this.el.setAttribute('data-id', def.id);

		// Accessibility
		this.el.setAttribute('aria-label', def.ariaLabel);
		this.el.setAttribute('tabindex', '-1'); // Reachable programmatically, not via Tab (avoids keyboard conflict with game)

		// Pointer events for press/release (works for both mouse + touch)
		this.el.addEventListener('pointerdown', this.onDown.bind(this));
		this.el.addEventListener('pointerup', this.onUp.bind(this));
		this.el.addEventListener('pointerleave', this.onUp.bind(this));
		this.el.addEventListener('pointercancel', this.onUp.bind(this));

		// Prevent context menu on long-press
		this.el.addEventListener('contextmenu', function (e: Event) { e.preventDefault(); });
	}

	private onDown(e: PointerEvent): void
	{
		e.preventDefault();
		if (this.pressed) return;
		this.pressed = true;
		this.el.classList.add('mc-btn--pressed');
		this.el.setAttribute('aria-pressed', 'true');
		this.emitFn(this.def.code, this.def.key, true, this.def.shiftKey);
	}

	private onUp(e: PointerEvent): void
	{
		if (!this.pressed) return;
		this.pressed = false;
		this.el.classList.remove('mc-btn--pressed');
		this.el.setAttribute('aria-pressed', 'false');
		this.emitFn(this.def.code, this.def.key, false, this.def.shiftKey);
	}

	/**
	 * Force release if the button is currently held down.
	 * Used when hiding controls to prevent stuck keys.
	 */
	public forceRelease(): void
	{
		if (this.pressed)
		{
			this.pressed = false;
			this.el.classList.remove('mc-btn--pressed');
			this.el.setAttribute('aria-pressed', 'false');
			this.emitFn(this.def.code, this.def.key, false, this.def.shiftKey);
		}
	}

	/**
	 * Remove button from DOM. If the button was still pressed,
	 * dispatches a keyup to prevent stuck keys.
	 */
	public destroy(): void
	{
		this.forceRelease();
		this.el.remove();
	}
}
