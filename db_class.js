const sqlite3 = require('sqlite3').verbose();

function close() {
	this.db.serialize(()=>{
	    this.db.close((err) => {
		if (err) {
		    return console.error(err.message);
		}
		console.log('Close the database connection.');
	    });
	})
}

function connect() {
    this.db = new sqlite3.Database('./db/QTDGame.db', (err) => {
	if (err) {
	    return console.error(err.message);
	}
	console.log('Connected to the SQlite database.');
    });
    return this.db
}

//player = [cookie, socket_id]
function addPlayer(player) {
    let addPlayerQ = 'INSERT INTO players(cookie, socket_id) VALUES (?,?);'
    this.db.serialize(()=>{
    	this.db.run(addPlayerQ,player,(err)=> {
			if(err) {
    	    	return console.error(err.message);
    		}
    	})
	})
	close();
}

//player = [cookie, socket_id]
function editPlayer (colName, keyVal, player) {
    let updateQ = "UPDATE players SET cookie = ?, socket_id = ?"
    updateQ += "WHERE " + colName + " = \"" + keyVal + "\";"
    this.db.serialize(()=>{
		this.db.run(updateQ, player,(err)=> {
		    if(err) {
	    		return console.error(err.message);
	    	}
		})
    })
    close();
}

function canPlayerJoin(newPlayerData, io, game, row) {
    if(row) {
    	const socketId = newPlayerData[1]
		console.log(row)
		for( i = 0 ; i < game.players.length ; ++i ) {
			if(row.socketId == game.players[i].socketId) {
				game.players[i].changeSocket(socketId)
				io.to(socketId).emit('go to game')
				editPlayer('cookie', newPlayerData[0], newPlayerData)
				return
			}
		}
		console.log('cannot add player to game in progress 1')
		io.to(socketId).emit('to lobby', false)
    } else {
		console.log('cannot add player to game in progress 2')
		io.to(socketId).emit('to lobby', false)
    }
}

function cookieInDB(newPlayerData, row) {
    if(row) {
		editPlayer('cookie', newPlayerData[0], newPlayerData)
    } else {
		addPlayer(newPlayerData)
    }
}

function getPlayerByCookieGame (playerCookie, newPlayerData, io, game, callback) {
    let playerQ = "SELECT cookie cookie, socket_id socketId FROM players WHERE cookie = ?"
    this.db.get(playerQ, [playerCookie],(err, row)=> {
	if(err) {
    	    return console.error(err.message);
    	}
    	callback(newPlayerData, io, game, row);
    })
}

function getPlayerByCookie (playerCookie, newPlayerData, callback) {
    let playerQ = "SELECT cookie cookie, socket_id socketId FROM players WHERE cookie = ?"
    this.db.get(playerQ, [playerCookie],(err, row)=> {
	console.log("getPlayerByCookie")
	if(err) {
    	    return console.error(err.message);
    	}
    	callback(newPlayerData, row);
    })
}

function getPlayerBySocket(playerSocket, callback) {
    let playerQ = "SELECT cookie cookie, socket_id socketId FROM players WHERE socket_id = ?"
    this.db.get(playerQ, [playerSocket],(err, row)=> {
	if(err) {
    	    return console.error(err.message);
    	}
    	callback(row);
    }) 
}

module.exports = {
    handleJoinGame: function(playerMap, io, game) {
		connect();
		let cookie = playerMap.get('cookie');
		let socketId = playerMap.get('socket_id');
		let newPlayerData = [cookie, socketId];
		getPlayerByCookieGame(cookie, newPlayerData, io, game, canPlayerJoin)
    },
    handleJoinLobby: function(playerMap) {
    	connect();
		let cookie = playerMap.get('cookie');
		let socketId = playerMap.get('socket_id');
		let newPlayerData = [cookie, socketId];
		getPlayerByCookie(cookie, newPlayerData, cookieInDB)
    },
}

