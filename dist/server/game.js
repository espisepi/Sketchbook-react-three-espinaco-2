"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor(io) {
        this.io = io;
        this.io.on("connection", (socket) => {
            console.log("a user connected : " + socket.id);
            //   socket.emit("joined", socket.id);
            socket.on("disconnect", () => {
                console.log("socket disconnected : " + socket.id);
                // io.emit("removePlayer", socket.id);
            });
        });
    }
}
exports.default = Game;
