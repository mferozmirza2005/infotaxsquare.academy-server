import { Socket, Server as SocketServer } from "@/node_modules/socket.io/dist/index";
import { Application, Request, Response } from "express";
import { Server as HTTPServer } from "http";
import usersChats from "@/utils/usersChats";
import roomData from "@/utils/roomData";
import { CorsOptions } from "cors";

const { conn } = require("./service/db-con");
const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");

const hostname = '127.0.0.1';
const port = 3000;

const app:Application = express();
const http_server:HTTPServer = createServer(app);
const io:SocketServer = new Server(http_server ,{
  cors: <CorsOptions>{
    origin: ["http://localhost:5000"],
    methods: ["GET", "POST"],
  },
});

app.get("/", (req: Request, res: Response)=>{
  res.status(200).contentType("html");
  res.end("<h1>Hello World! from express application.</h1>\n");
});

app.get("/messages/:turn/:userId/", (req: Request, res: Response)=>{
  const turn: number = parseInt(req.params.turn);
  const userId: number = parseInt(req.params.userId);

  conn.query(`SELECT * FROM chatapp_userschats WHERE senderId="${userId}" OR receiverId="${userId}";`, function (err:Error, result:usersChats[]) {
    if (err) {
      return res.end(err);
    };
    const data: usersChats[] = result.slice(turn,turn+10);
    res.end(res.json(data));
  });
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket: Socket) => {
  socket.on("room:join", (data: roomData) => {
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

http_server.listen(port);