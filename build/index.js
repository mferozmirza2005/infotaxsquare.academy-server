"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { conn } = require("./service/db-con");
const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const hostname = '127.0.0.1';
const port = 3000;
const app = express();
const http_server = createServer(app);
const io = new Server(http_server, {
    cors: {
        origin: ["http://localhost:5000"],
        methods: ["GET", "POST"],
    },
});
app.get("/", (req, res) => {
    res.status(200).contentType("html");
    res.end("<h1>Hello World! from express application.</h1>\n");
});
app.get("/messages/:turn/:userId/", (req, res) => {
    const turn = parseInt(req.params.turn);
    const userId = parseInt(req.params.userId);
    conn.query(`SELECT * FROM chatapp_userschats WHERE senderId="${userId}" OR receiverId="${userId}";`, function (err, result) {
        if (err) {
            return res.end(err);
        }
        ;
        const data = result.slice(turn, turn + 10);
        res.end(res.json(data));
    });
});
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
    socket.on("room:join", (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        // io.to(room).emit("user:joined", { email, id: socket.id });
        io.to(room).emit("room:join", { email, id: socket.id });
        socket.join(room);
    });
    socket.on("user:call", ({ to, offer }) => {
        // console.log(to, offer);
        io.to(to).emit("incomming:call", { from: socket.id, offer });
        io.to(to).emit("calling", { from: socket.id, offer });
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
http_server.listen(port);
