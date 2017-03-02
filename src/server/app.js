import path from "path";
import express from "express";
import socketio from "socket.io";
import http from "http";
import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
import webpackConfig from "../../webpack.config.js";

// Use 'express.static' for production!

const app = express();

const compiler = webpack(webpackConfig);
app.use(webpackMiddleware(compiler, {
	publicPath: webpackConfig.output.publicPath,
	stats: {colors: true}
}));

const router = express.Router();

router.get("/", (req, res) => {
	const filename = path.join(compiler.outputPath, "index.html");
	compiler.outputFileSystem.readFile(filename, (err, result) => {
		res.set("content-type", "text/html");
		res.send(result);
		res.end();
	});
});

app.use(router);

const server = http.createServer(app);
const io = socketio(server);
io.on("connection", client => {
	console.log("Connected")

	client.on("disconnect", () => {
		console.log('A user disconnected');
	});

	client.on("input", (data) => {
		client.emit("input", data);
	});

	client.on("inputoff", (data) => {
		console.log(data);
		client.emit("inputoff", data);
	});
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});