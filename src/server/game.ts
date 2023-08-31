import socketIO from "socket.io";

export default class Game {
  io: socketIO.Server;

  constructor(io: socketIO.Server) {
    this.io = io;

    this.io.on("connection", (socket: any) => {
      console.log("a user connected : " + socket.id);
      //   socket.emit("joined", socket.id);

      socket.on("disconnect", () => {
        console.log("socket disconnected : " + socket.id);
        // io.emit("removePlayer", socket.id);
      });
    });
  }
}
