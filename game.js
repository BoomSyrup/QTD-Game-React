const csv = require('csv-parser')
const fs = require('fs');
var io
const db = require('./db_class')
const { v4: uuidv4 } = require('uuid')
var games = []


module.exports =  {
	initIo: function(serverIo) {
		io = serverIo
	},
	handleGame: function (socket) {
		socket.on('join', (roomId, player) => {
			let map = playerToMap(player, io, socket)
			joinRoom(roomId, map)
	    });

	    socket.on('create', (player) => {
	    	let map = playerToMap(player, io, socket)
			db.handleJoinLobby(map)
			createRoom(map.get('room_id'), map)
	    })

	    socket.on('create room', ()=> {
	    	let newRoomId = generateRoomId()
	    	io.to(socket.id).emit('room created', newRoomId)
	    });

	    socket.on('request lobby size', () => {
	    	updateLobbySize(socket)
		})

	    socket.on('start game', (verseLoc) => {
	    	startGame(verseLoc, socket)
	    })

	    socket.on('disconnect', () => {
			console.log('disconnect')
			roomId = findRoomId(socket)
			if(roomId) {
				removePlayer(roomId, socket)
			}
    	})

    	socket.on('request game data',() => {
    		const game = getGameFromSocket(socket)
    		for( i = 0 ; i < game.players.length ; ++i ) {
    			if(game.players[i].socketId == socket.id) {
    				io.to(game.players[i].socketId).emit('game data', {runningVerse: game.runningVerse, verseLoc: game.verseLoc, lives: game.lives, vocab: game._players[i].vocab, length: game.correctVerse.length, error: ""})
				}
			}	
    	})

    	socket.on('guess', (word) => {
    		const game = getGameFromSocket(socket)
			let guessVerse = [...game.runningVerse]
			guessVerse.push(word)
			let lastIdx = guessVerse.length - 1
			if(guessVerse[lastIdx] != game.correctVerse[lastIdx]) {
				console.log("Wrong Guess")
				game.loseLife()
				if(game.lives == 0) {
					console.log("Game over")
					for( i = 0 ; i < game.players.length ; ++i ) {
						io.to(game.players[i].socketId).emit('game over', false, game.correctVerse.join(' '))
					}
					deleteGame(socket)
				} else {
					const player = game.getPlayerFromSocket(socket)
					const error = player.name + " guessed " + "\"" + word + "\""
					for( i = 0 ; i < game.players.length ; ++i ) {
						io.to(game.players[i].socketId).emit('game data', {runningVerse: game.runningVerse, verseLoc: game.verseLoc, lives: game.lives, vocab: game._players[i].vocab, length: game.correctVerse.length, error: error})
					}
				}
				return
			}

			if(guessVerse.length == game.correctVerse.length) {
				console.log("win")
				for( i = 0 ; i < game.players.length ; ++i ) {
					io.to(game.players[i].socketId).emit('game over', true, game.correctVerse.join(' '))
				}
				deleteGame(socket)

			} else {
				console.log("correct guess")
				game.runningVerse.push(word)
				for( i = 0 ; i < game.players.length ; ++i ) {
					io.to(game.players[i].socketId).emit('game data', {runningVerse: game.runningVerse, verseLoc: game.verseLoc, lives: game.lives, vocab: game._players[i].vocab, length: game.correctVerse.length, error: ""})
				}

			}
		});
	}
}

function joinRoom(roomId, player) {
	const gameIdx = getGameIdx(roomId) 
	if(gameIdx != -1) {
		const game = games[gameIdx]
		if(game._started) {
			db.handleJoinGame(player,io, game)
		} else {
			const playerObj = new Player(player.get('socket_id'), player.get('name'))
			io.to(player.get('socket_id')).emit('to lobby', true)
			db.handleJoinLobby(player, io)
			game.addPlayer(playerObj)
		}
	} else {
		io.to(player.get('socket_id')).emit('to lobby', false)
	}
}

function updateLobbySize(socket) {
	const game = getGameFromSocket(socket)
	const players = game.players
	const playersSize = players.length;
	for( i = 0 ; i < playersSize ; ++i ) {
		io.to(players[i].socketId).emit('update lobby size', playersSize)
	} 
}

function createRoom(roomId, player) {
	const game = new Game(roomId)
	const playerObj = new Player(player.get('socket_id'), player.get('name'))
	game.addPlayer(playerObj)
	games.push(game)
}

function startGame(verseLoc, socket) {
	const game = getGameFromSocket(socket)
	game.init(verseLoc)
}

function getGameIdx(roomId) {
	for( i = 0 ; i < games.length ; ++i ) {
		if(games[i].roomId == roomId) {
			return i;
		}
	}
	return -1;
}

function removePlayer(roomId, socket) {
	const gameIdx = getGameIdx(roomId)	
	const game = games[gameIdx]
	if(!game.started){
		for( i = 0 ; i < game.players.length ; ++i) {
			if(game.players[i].socketId == socket.id){
				game.players.splice(i,1)
				break;
			}
		}
		if(game.players.length == 0) {
			const gameIdx = getGameIdx(roomId)
			games.splice(gameIdx,1)
		} else {
			const lobbySize = game.players.length
			const players = game.players
			for( i = 0 ; i < lobbySize ; ++i ) {
				io.to(players[i].socketId).emit('update lobby size', lobbySize)
			}
		}
	}
}

function findRoomId(socket) {
	for( i = 0 ; i < games.length ; ++i ) {
		for( j = 0 ; j < games[i].players.length ; ++j ) {
			if(socket.id == games[i].players[j].socketId) {
				return games[i].roomId
			}
		}
	}
	return null
}

function getGameFromSocket(socket) {
	const roomId = findRoomId(socket)
	const gameIdx = getGameIdx(roomId)	
	const game = games[gameIdx]
	return game
}

function deleteGame(socket) {
	const roomId = findRoomId(socket)
	const gameIdx = getGameIdx(roomId)
	games.splice(gameIdx,1)
}

function generateRoomId() {
    let roomId = ""
	while(roomId == "" || getGameIdx(roomId) != -1) {
		const roomIdLetters = 2
		const roomIdNumbers = 2
    	var roomIdArr = []
	    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	    var numbers = '1234567890'
	    var charactersLength = characters.length
	    var numbersLength = numbers.length
	    for ( var i = 0; i < roomIdLetters; i++ ) {
	    	roomIdArr.push(characters.charAt(Math.floor(Math.random() * 
	 		charactersLength)));
	    }
	    for ( var i = 0; i < roomIdNumbers; i++ ) {
	    	roomIdArr.push(numbers.charAt(Math.floor(Math.random() * 
	 		numbersLength)));
	    }
	    roomId = roomIdArr.join('');
	    return roomId
	}
}

class Game {
	constructor(roomId) {
		this._memVerse = "";
		this._lives = 0
		this._correctVerse = []
		this._runningVerse = []
		this._verseLoc = ""
		this._roomId = roomId
		this._started = false
		this._players = []
	}
	addPlayer(player) {
		this.players.push(player)
	}
	get players() {
		return this._players
	}
	get roomId() {
		return this._roomId
	}
	get started() {
		return this._started
	}
	get verseLoc() {
		return this._verseLoc
	}
	get runningVerse() {
		return this._runningVerse
	}
	get correctVerse() {
		return this._correctVerse
	}
	get lives() {
		return this._lives
	}
	get memVerse() {
		return this._memVerse
	}
	loseLife() {
		this._lives--
	}
	init(verseLoc) {
		this._verseLoc = verseLoc
		fs.createReadStream('memoryVerses.csv')
		.pipe(csv())
		.on('data', (row) => {
    		if(row.loc == verseLoc) {
    			this._memVerse = row.verse
    		}
  		})
		.on('end', () => {	
			//Split up words
			this._correctVerse = this._memVerse.split(' ')
			this._lives = Math.ceil(this._correctVerse.length / 2)
			let uniqueWords = new Set(this._correctVerse)
			let words = Array.from(uniqueWords)
			let wordsTaken = new Map()
			words.forEach((word) => {
				wordsTaken.set(word, false)
			})
			//Distribute
			for( i = 0 ; i < words.length ; i++ ) {
				let notSelected = true
				let randWord
				while(notSelected){
					let randIdx = Math.floor(Math.random() * (words.length))
					randWord = words[randIdx]
					notSelected = wordsTaken.get(randWord)
				}
				wordsTaken.set(randWord, true)
				let player = this._players[i % this._players.length]
				player.push(randWord)
			}
			this._started = true;
			for( i = 0 ; i < this._players.length ; ++i ) {
				io.to(this._players[i].socketId).emit('go to game');
			}			
	  	});
	}
	getPlayerFromSocket(socket){
		for( i = 0 ; i < this._players.length ; ++i ) {
			if(this._players[i].socketId == socket.id) {
				return this._players[i]
			}
		}
	}
}

class Player {
	constructor(socketId, name) {
		this._socketId = socketId
		this._vocab = []
		this._name = name
	}
	get socketId() {
		return this._socketId
	}
	get vocab() {
		return this._vocab
	}
	get name() {
		return this._name
	}
	push(word) {
		this._vocab.push(word)
	}
	changeSocket(newSocketId) {
		this._socketId = newSocketId
	}
}

function playerToMap(player, io, socket) {
	var name = player.name
	var roomId = player.room
	var cookie = player.cookie
	var socketId = player.socketId
	if(!cookie) {
	    cookie = uuidv4()
	    io.to(socket.id).emit('cookie', cookie)
	}
	let map = new Map();
	map.set('name',name)
	map.set('room_id',roomId)
	map.set('cookie', cookie)
	map.set('socket_id', socketId)
	return map
}
