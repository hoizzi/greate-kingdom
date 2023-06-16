//import modules
import http from "http";
import SocketIO from "socket.io";
import express from "express";

//create express server
const app = express();

//setup express server
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

//handleListner of express server
const handleListen = () => console.log("Listening on http://localhost:3000");

//create http server on express server, webSocket server on http server
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

//webSocket server side code
wsServer.on("connection", (socket) => {
    
});

//listen express server
httpServer.listen(3000, handleListen);