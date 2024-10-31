import { World } from "../../../ts/sketchbook";

import * as nipplejs from "nipplejs";
import { VideoPoints } from "../prefabs/videopoints/VideoPoints";
import Swal from "sweetalert2";
import { HorseScene } from "../scenes/horse-scene/HorseScene";

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

export class WorldCustom extends World {
  public joystickState: JoystickState;

  public videoPoints: VideoPoints;

  constructor(worldScenePath?: any) {
    super(worldScenePath);
    console.log("OYEEEEEEEEEEEEE");

    // Swal.fire({
    //   title: "Welcome to VideoPoints!",
    //   text: "Click to Start Music!",
    //   footer:
    //     '<a href="https://github.com/swift502/Sketchbook" target="_blank">GitHub page</a><a href="https://discord.gg/fGuEqCe" target="_blank">Discord server</a>',
    //   confirmButtonText: "Okay",
    //   buttonsStyling: false,
    //   onClose: () => {
    //     this.addObjectsInScene();
    //   },
    // });
    const self = this;
    const button = document.createElement("button");
    button.value = "PULSSAAAAA";
    button.style.zIndex = "9999";
    button.style.position = "absolute";
    button.style.bottom = "100px";
    button.style.right = "100px";
    button.addEventListener("click", (e) => {
      console.log("Pulsado el boton para iniciar videopoints!");
      self.videoPoints.video.play();
    });
    document.body.appendChild(button);

    this.addObjectsInScene();
  }

  public addObjectsInScene(): void {
    // Este es mi lienzo, aqui voy anadiendo los objetos

    // Add VideoPoints
    this.videoPoints = new VideoPoints(this.graphicsWorld);
    this.registerUpdatable(this.videoPoints);

    // Add HorseScene
    const horseScene = new HorseScene(this.graphicsWorld, this.loadingManager);
    this.registerUpdatable(horseScene);

  }

  public updateControls(controls: Array<Control>): void {
    super.updateControls(controls);
    // Pintar
    // console.log({controls});
    this.renderUIMobileButtons(controls);
  }

  private renderUIMobileButtons(controls: Array<Control>): void {
    this.renderJoystickCameraMovement();
    for (let i = 0; i < controls.length; i++) {
      const control = controls[i];
      if (control.desc === "Movement") {
        this.renderMovementButtons(control);
      }
    }
  }

  private renderMovementButtons(control: Control): void {
    for (let i = 0; i < control.keys.length; i++) {
      const key = control.keys[i];
      if (key === "W") {
        this.renderMovementButtonUp();
      }
      if (key === "S") {
        this.renderMovementButtonDown();
      }
      if (key === "A") {
        this.renderMovementButtonLeft();
      }
      if (key === "A") {
        this.renderMovementButtonRight();
      }
    }
  }

  private renderMovementButtonUp(): void {
    // 1. Create the button
    const button = document.createElement("button");
    button.innerHTML = "";

    // 2. Add styles button
    button.className = "button-custom up-arrow";

    // 3. Append somewhere
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    // 4. Add event handler
    button.addEventListener("pointerdown", function () {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "w", code: "KeyW" })
      );
    });
    button.addEventListener("pointerup", function () {
      document.dispatchEvent(
        new KeyboardEvent("keyup", { key: "w", code: "KeyW" })
      );
    });
    button.addEventListener("pointerout", function () {
      document.dispatchEvent(
        new KeyboardEvent("keyup", { key: "w", code: "KeyW" })
      );
    });
  }

  private renderMovementButtonDown(): void {
    // 1. Create the button
    const button = document.createElement("button");
    button.innerHTML = "";

    // 2. Add styles button
    button.className = "button-custom down-arrow";

    // 3. Append somewhere
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    // 4. Add event handler
    button.addEventListener("pointerdown", function () {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "s", code: "KeyS" })
      );
    });
    button.addEventListener("pointerup", function () {
      document.dispatchEvent(
        new KeyboardEvent("keyup", { key: "s", code: "KeyS" })
      );
    });
    button.addEventListener("pointerout", function () {
      document.dispatchEvent(
        new KeyboardEvent("keyup", { key: "s", code: "KeyS" })
      );
    });
  }

  private renderMovementButtonLeft(): void {
    // 1. Create the button
    const button = document.createElement("button");
    button.innerHTML = "";

    // 2. Add styles button
    button.className = "button-custom left-arrow";

    // 3. Append somewhere
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    // 4. Add event handler
    button.addEventListener("pointerdown", function () {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "a", code: "KeyA" })
      );
    });
    button.addEventListener("pointerup", function () {
      document.dispatchEvent(
        new KeyboardEvent("keyup", { key: "a", code: "KeyA" })
      );
    });
    button.addEventListener("pointerout", function () {
      document.dispatchEvent(
        new KeyboardEvent("keyup", { key: "a", code: "KeyA" })
      );
    });
  }

  private renderMovementButtonRight(): void {
    // 1. Create the button
    const button = document.createElement("button");
    button.innerHTML = "";

    // 2. Add styles button
    button.className = "button-custom right-arrow";

    // 3. Append somewhere
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    // 4. Add event handler
    button.addEventListener("pointerdown", function () {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "d", code: "KeyD" })
      );
    });
    button.addEventListener("pointerup", function () {
      document.dispatchEvent(
        new KeyboardEvent("keyup", { key: "d", code: "KeyD" })
      );
    });
    button.addEventListener("pointerout", function () {
      document.dispatchEvent(
        new KeyboardEvent("keyup", { key: "d", code: "KeyD" })
      );
    });
  }

  private renderJoystickCameraMovement(): void {
    // 1. Create the element
    const element = document.createElement("div");
    element.innerHTML = "";

    // 2. Add styles button
    element.className = "zone-joystick";

    // 3. Append somewhere
    const body = document.getElementsByTagName("body")[0];
    body.appendChild(element);

    // 4. Attach Joystick
    const options = {
      zone: element,
      // mode: "static",
      position: { left: "50%", top: "50%" },
      size: 100,
    };
    const joystick = nipplejs.create(options);
    // console.log(joystick);
    this.joystickState = {
      joystick: joystick,
      isMove: false,
      velocityMove: 5,
      position: {
        x: 0,
        y: 0,
      },
    };
    // 5. Add event handlers for joystick movements
    const joystickState = this.joystickState;
    joystick.on("start", (event, nipple) => {
      // const x = nipple.vector.x;
      // const y = nipple.vector.y;
      // console.log(ev);
      // document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', code: 'KeyW' }));
      // joystickState.isMove = true;
      // joystickState.position.x = x;
      // joystickState.position.y = y;
    });

    joystick.on("end", (event, nipple) => {
      // console.log(event);
      // document.dispatchEvent(new KeyboardEvent('keyup', { key: 'w', code: 'KeyW' }));
      joystickState.isMove = false;
      joystickState.position.x = 0;
      joystickState.position.y = 0;
    });
    joystick.on("move", (event, nipple) => {
      const x = nipple.vector.x;
      const y = nipple.vector.y;

      // Utiliza los valores de x e y según sea necesario
      // console.log("Posición X:", x);
      // console.log("Posición Y:", y);
      joystickState.isMove = true;
      joystickState.position.x = x;
      joystickState.position.y = y;
      // this.cameraOperator.move(x,y); // Se hace en el metodo update
    });
  }

  public update(timeStep: number, unscaledTimeStep: number): void {
    super.update(timeStep, unscaledTimeStep);
    if (this.joystickState?.isMove) {
      this.cameraOperator.move(
        this.joystickState.position.x * this.joystickState.velocityMove,
        this.joystickState.position.y * this.joystickState.velocityMove
      );
    }
  }
}
