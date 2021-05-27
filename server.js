const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const cookieParser = require('cookie-parser')
const game = require('./game')
const PORT = process.env.PORT || 5000;

game.initIo(io)
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
  	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

io.on('connection', (socket) => {
    console.log('CONNECTED')
    game.handleGame(socket)
});
