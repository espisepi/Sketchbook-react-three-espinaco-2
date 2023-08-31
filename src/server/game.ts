import socketIO from "socket.io";

import Player from "./player";

export default class Game {
  io: socketIO.Server;

  players: { [id: string]: Player } = {};
  playerCount = 0;

  constructor(io: socketIO.Server) {
    this.io = io;

    this.io.on("connection", (socket: any) => {
      console.log("a user connected : " + socket.id);

      this.players[socket.id] = new Player();
      this.players[socket.id].sn = "Guest" + this.playerCount++;

      socket.emit("joined", socket.id, this.players[socket.id].sn);

      socket.on("disconnect", () => {
        console.log("socket disconnected : " + socket.id);
        if (this.players && this.players[socket.id]) {
          console.log("deleting " + socket.id);
          delete this.players[socket.id];
          io.emit("removePlayer", socket.id);
        }
      });

      socket.on("update", (message: any) => {
        if (this.players[socket.id]) {
          this.players[socket.id].t = message.t;
          this.players[socket.id].p = message.p;
          this.players[socket.id].q = message.q;
          this.players[socket.id].v = message.v;
          this.players[socket.id].tp = message.tp;
          this.players[socket.id].tq = message.tq;
          this.players[socket.id].w[0].p = message.w[0].p;
          this.players[socket.id].w[0].q = message.w[0].q;
          this.players[socket.id].w[1].p = message.w[1].p;
          this.players[socket.id].w[1].q = message.w[1].q;
          this.players[socket.id].w[2].p = message.w[2].p;
          this.players[socket.id].w[2].q = message.w[2].q;
          this.players[socket.id].w[3].p = message.w[3].p;
          this.players[socket.id].w[3].q = message.w[3].q;
          this.players[socket.id].b[0].p = message.b[0].p;
          this.players[socket.id].b[0].c = message.b[0].c;
          this.players[socket.id].b[1].p = message.b[1].p;
          this.players[socket.id].b[1].c = message.b[1].c;
          this.players[socket.id].b[2].p = message.b[2].p;
          this.players[socket.id].b[2].c = message.b[2].c;
        }
      });
    });
  }
}
