
import { World } from '../../../ts/sketchbook';

import * as nipplejs from 'nipplejs';


interface Control {
    desc: String;
    keys: Array<String>;
}

export class WorldCustom extends World {

    constructor(worldScenePath?: any) {
        super(worldScenePath);
        console.log("OYEEEEEEEEEEEEE");
    }

    public updateControls(controls: Array<Control>): void {
        super.updateControls(controls);
        // Pintar 
        console.log({controls});
        this.renderUIMobileButtons(controls);
    }

    private renderUIMobileButtons(controls: Array<Control>): void {
        this.renderJoystickCameraMovement();
        for( let i = 0; i < controls.length; i++) {
            const control = controls[i];
            if(control.desc === 'Movement') {
                this.renderMovementButtons(control);
            }
        }
    }

    private renderMovementButtons(control: Control): void {
        for( let i = 0; i < control.keys.length; i++) {
            const key = control.keys[i];
            if(key === 'W') {
                this.renderMovementButtonUp();
            }
            if(key === 'S') {
                this.renderMovementButtonDown();
            }
            if(key === 'A') {
                this.renderMovementButtonLeft();
            }
            if(key === 'A') {
                this.renderMovementButtonRight();
            }
        }
    }

    private renderMovementButtonUp(): void {
        // 1. Create the button
        const button = document.createElement("button");
        button.innerHTML = "";

        // 2. Add styles button
        button.className = 'button-custom up-arrow';

        // 3. Append somewhere
        const body = document.getElementsByTagName("body")[0];
        body.appendChild(button);

        // 4. Add event handler
        button.addEventListener ("pointerdown", function() {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', code: 'KeyW' }));
        });
        button.addEventListener ("pointerup", function() {
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 'w', code: 'KeyW' }));
        });
        button.addEventListener ("pointerout", function() {
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 'w', code: 'KeyW' }));
        });
    }

    private renderMovementButtonDown(): void {
        // 1. Create the button
        const button = document.createElement("button");
        button.innerHTML = "";

        // 2. Add styles button
        button.className = 'button-custom down-arrow';

        // 3. Append somewhere
        const body = document.getElementsByTagName("body")[0];
        body.appendChild(button);

        // 4. Add event handler
        button.addEventListener ("pointerdown", function() {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', code: 'KeyS' }));
        });
        button.addEventListener ("pointerup", function() {
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 's', code: 'KeyS' }));
        });
        button.addEventListener ("pointerout", function() {
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 's', code: 'KeyS' }));
        });
    }

    private renderMovementButtonLeft(): void {
        // 1. Create the button
        const button = document.createElement("button");
        button.innerHTML = "";

        // 2. Add styles button
        button.className = 'button-custom left-arrow';

        // 3. Append somewhere
        const body = document.getElementsByTagName("body")[0];
        body.appendChild(button);

        // 4. Add event handler
        button.addEventListener ("pointerdown", function() {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', code: 'KeyA' }));
        });
        button.addEventListener ("pointerup", function() {
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', code: 'KeyA' }));
        });
        button.addEventListener ("pointerout", function() {
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', code: 'KeyA' }));
        });
    }

    private renderMovementButtonRight(): void {
        // 1. Create the button
        const button = document.createElement("button");
        button.innerHTML = "";

        // 2. Add styles button
        button.className = 'button-custom right-arrow';

        // 3. Append somewhere
        const body = document.getElementsByTagName("body")[0];
        body.appendChild(button);

        // 4. Add event handler
        button.addEventListener ("pointerdown", function() {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', code: 'KeyD' }));
        });
        button.addEventListener ("pointerup", function() {
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', code: 'KeyD' }));
        });
        button.addEventListener ("pointerout", function() {
            document.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', code: 'KeyD' }));
        });
    }

    private renderJoystickCameraMovement(): void {
        // 1. Create the element
        const element = document.createElement("div");
        element.innerHTML = "";

        // 2. Add styles button
        element.className = 'zone-joystick';

        // 3. Append somewhere
        const body = document.getElementsByTagName("body")[0];
        body.appendChild(element);

        // 4. Add event handler
        const options = {
            zone: element,
            // mode: "static",
            position: { left: "50%", top: "50%" },
            size: 100,
        };
        const joystick = nipplejs.create(options);
        console.log(joystick);
        // 3. Add event handlers for joystick movements
        joystick.on("start", (ev) => {
            console.log(ev);
            // document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', code: 'KeyW' }));
        });

        joystick.on("end", (ev) => {
            console.log(ev);
            // document.dispatchEvent(new KeyboardEvent('keyup', { key: 'w', code: 'KeyW' }));
        });
        joystick.on("move", (event, nipple) => {
            const x = nipple.vector.x;
            const y = nipple.vector.y;
        
            // Utiliza los valores de x e y según sea necesario
            console.log("Posición X:", x);
            console.log("Posición Y:", y);
            this.cameraOperator.move(x,y);
          });
    }


}