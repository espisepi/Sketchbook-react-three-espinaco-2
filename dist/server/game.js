"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import Player from './player'
// import Physics from './physics'
// import * as CANNON from 'cannon-es'
class Game {
    // physics: Physics
    // gameClock = 1
    // gamePhase = 0 //0=closed, 1=open
    // gameId: number = 0
    // gameWinner: string = ''
    // recentWinners = [
    //     { screenName: 'fcs', score: 120 },
    //     { screenName: 'sbcode', score: 110 },
    //     { screenName: 'SeanWasEre', score: 100 },
    //     { screenName: 'cosmo', score: 90 },
    //     { screenName: 'emmy', score: 80 },
    // ]
    // winnersCalculated = false
    // players: { [id: string]: Player } = {}
    // playerCount = 0
    constructor(io) {
        this.io = io;
        this.io.on("connection", (socket) => {
            console.log("a user connected : " + socket.id);
            socket.emit("joined", socket.id);
            socket.on("disconnect", () => {
                console.log("socket disconnected : " + socket.id);
                io.emit("removePlayer", socket.id);
            });
            socket.on("update", (message) => { });
        });
    }
}
exports.default = Game;
