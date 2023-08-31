import { World } from "../sketchbook";
import { io, Socket } from "socket.io-client";

export class GameMultiplayer {
  world: World;
  socket: Socket;
  constructor(world: World) {
    console.log("Ejecutando GameMultiplayer!!!");
    this.world = world;
    this.socket = io();

    this.configureSocket();
  }

  private configureSocket(): void {
    this.socket.on("connect", function () {
      console.log("connected");
    });
    this.socket.on("disconnect", (message: any) => {
      console.log("disconnected " + message);
    });
  }
}
