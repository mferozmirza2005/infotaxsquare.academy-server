const conn = require("./service/db-con.js").conn;
const express = require("express");
const http = require("http");
const socket_io = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socket_io(server, {
    cors: {
        origin: ["*"],
        methods: ["GET", "POST"],
    },
});
const hostname = '127.0.0.1';
const port = 3000;
app.get("/", (req, res) => {
    res.status(200).contentType("html");
    res.end("<h1>Hello World! from express application.</h1>\n");
});
app.get("/messages/:turn/:userId/", (req, res) => {
    const turn = parseInt(req.params.turn);
    const userId = parseInt(req.params.userId);
    console.log(turn, userId);
    conn.query(`SELECT * FROM chatapp_userschats WHERE sender_id="${userId}" OR receiver_id="${userId}";`, function (err, result) {
        if (err)
            throw err;
        const data = result.slice(turn, turn + 10);
        res.end(res.json(data));
    });
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
server.listen(port, hostname, ()=>{
    console.log("server is running on http://127.0.0.1:3000/")
});
