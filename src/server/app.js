var express = require("express");
var socketio = require("socket.io");
var http = require("http.io");

var app = express();

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});

var server = http.createServer(app);
var io = socketio(server);
io.on("connection", function() {
	console.log("Connected")
});
server.listen(3000);