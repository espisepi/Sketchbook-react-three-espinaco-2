import { Character } from "../characters/Character";
import { World } from "../sketchbook";
import { io, Socket } from "socket.io-client";

export class GameMultiplayer {
  socket: Socket;

  world: World;
  character?: Character;

  private myId = "";
  private updateInterval: any; //used to update server
  players: { [id: string]: Character } = {};

  constructor(world: World) {
    console.log("Ejecutando GameMultiplayer!!!", { GameMultiplayer: this });
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
      clearInterval(this.updateInterval);
      Object.keys(this.players).forEach((p) => {
        this.players[p].removeFromWorld(this.world);
      });
    });

    this.socket.on("joined", (id: string, screenName: string) => {
      console.log("joined new player: ===== ", screenName);
      this.myId = id;

      this.updateInterval = setInterval(() => {
        this.socket.emit("update", {
          t: Date.now(),
          p: this.world.characterPlayer?.position,
          q: this.world.characterPlayer?.quaternion,
          v: null,
          tp: null,
          tq: null,
          w: [
            {
              p: null,
              q: null,
            },
            {
              p: null,
              q: null,
            },
            {
              p: null,
              q: null,
            },
            {
              p: null,
              q: null,
            },
          ],
          b: [
            {
              p: null,
              c: null,
            },
            {
              p: null,
              c: null,
            },
            {
              p: null,
              c: null,
            },
          ],
        });
      }, 50);
    });
  }
}
