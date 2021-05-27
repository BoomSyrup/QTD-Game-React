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
const PORT = process.env.PORT || 3000;

game.initIo(io)
app.use(cookieParser())
app.use(express.static('static'))

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

io.on('connection', (socket) => {
    console.log('CONNECTED')
    game.handleGame(socket)
});
