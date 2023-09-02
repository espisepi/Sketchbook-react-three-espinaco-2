import { Character } from "../characters/Character";
import { World } from "../sketchbook";
import { Socket } from "socket.io-client";
export declare class GameMultiplayer {
    socket: Socket;
    world: World;
    character?: Character;
    private myId;
    private updateInterval;
    players: {
        [id: string]: Character;
    };
    constructor(world: World);
    private configureSocket;
}
