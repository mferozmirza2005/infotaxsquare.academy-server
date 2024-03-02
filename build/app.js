import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import express from "express";
import conn from "./service/db-con";
const app = express();
const server = createServer(app);
app.get("/messages/:turn/:userId/:", (req, res) => {
    const turn = parseInt(req.params.turn);
    const userId = parseInt(req.params.userId);
    console.log(turn, userId);
    conn.query(`SELECT * FROM chatapp_userschats WHERE senderId="${userId}" OR receiverId="${userId};`, function (err, result) {
        if (err)
            throw err;
        const data = result.slice(turn, turn + 10);
        res.json(data);
    });
});
const io = new SocketServer(server, {
    cors: {
        origin: ["http://localhost:5000"],
        methods: ["GET", "POST"],
    },
});
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
io.on("connection", (socket) => {
    socket.on("room:join", (data) => {
        const email = data.email;
        const room = data.room;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        io.to(room).emit("user:joined", { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
    });
    socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit("incomming:call", { from: socket.id, offer });
    });
    socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    });
    socket.on("peer:nego:needed", ({ to, offer }) => {
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });
    socket.on("peer:nego:done", ({ to, ans }) => {
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
});
const SERVER_PORT = process.env.PORT || 8080;
server.listen(SERVER_PORT);
const APP_PORT = process.env.PORT || 8000;
app.listen(APP_PORT);
process.on("SIGINT", () => {
    server.close(() => {
        process.exit(0);
    });
});
