const Pool = require('pg').Pool
const pool = new Pool({
	user: 'me',
  	host: 'localhost',
  	database: 'connections',
  	password: 'password',
  	port: 5432,
})



// //player = [cookie, socket_id]
// function addPlayer(player) {
//     let addPlayerQ = 'INSERT INTO players(cookie, socket_id) VALUES (?,?);'
//     this.db.serialize(()=>{
//     	this.db.run(addPlayerQ,player,(err)=> {
// 			if(err) {
//     	    	return console.error(err.message);
//     		}
//     	})
// 	})
// 	close();
// }

// //player = [cookie, socket_id]
// function editPlayer (colName, keyVal, player) {
//     let updateQ = "UPDATE players SET cookie = ?, socket_id = ?"
//     updateQ += "WHERE " + colName + " = \"" + keyVal + "\";"
//     this.db.serialize(()=>{
// 		this.db.run(updateQ, player,(err)=> {
// 		    if(err) {
// 	    		return console.error(err.message);
// 	    	}
// 		})
//     })
//     close();
// }

// function cookieInDB(newPlayerData, row) {
//     if(row) {
// 		editPlayer('cookie', newPlayerData[0], newPlayerData)
//     } else {
// 		addPlayer(newPlayerData)
//     }
// }

// function getPlayerByCookieGame (playerCookie, newPlayerData, io, game, callback) {
//     let playerQ = "SELECT cookie cookie, socket_id socketId FROM players WHERE cookie = ?"
//     this.db.get(playerQ, [playerCookie],(err, row)=> {
// 	if(err) {
//     	    return console.error(err.message);
//     	}
//     	callback(newPlayerData, io, game, row);
//     })
// }

// function getPlayerByCookie (playerCookie, newPlayerData, callback) {
//     let playerQ = "SELECT cookie cookie, socket_id socketId FROM players WHERE cookie = ?"
//     this.db.get(playerQ, [playerCookie],(err, row)=> {
// 	console.log("getPlayerByCookie")
// 	if(err) {
//     	    return console.error(err.message);
//     	}
//     	callback(newPlayerData, row);
//     })
// }

// function getPlayerBySocket(playerSocket, callback) {
//     let playerQ = "SELECT cookie cookie, socket_id socketId FROM players WHERE socket_id = ?"
//     this.db.get(playerQ, [playerSocket],(err, row)=> {
// 	if(err) {
//     	    return console.error(err.message);
//     	}
//     	callback(row);
//     }) 
// }

const handleJoinGame = (playerMap, io, game) => {
	let cookie = playerMap.get('cookie');
	let socketId = playerMap.get('socket_id');
	console.log('handle join game')
	console.log(cookie)
	let newPlayerData = [cookie, socketId];
	let playerQ = "SELECT cookie cookie, socket_id socketid FROM players WHERE cookie = $1"
	pool.query(playerQ, [cookie], (error, results) => {
		if(error) {
			console.log(1)
	    	return console.error(error.message);
		}
		if(results.rows.length) {
			for( i = 0 ; i < game.players.length ; ++i ) {
				if(results.rows[0]["socketid"] == game.players[i].socketId) {
					game.players[i].changeSocket(socketId)
					io.to(socketId).emit('go to game')
					let updateQ = "UPDATE players SET cookie = $1, socket_id = $2 WHERE cookie = $1"
					pool.query(updateQ, [cookie, socketId], (error, results) => {
						if(error) {
							console.log(2)
							return console.error(error.message);
						}
					})
				}
			}
			console.log('cannot add player to game in progress 1')
			io.to(socketId).emit('to lobby', false)
	    } else {
			console.log('cannot add player to game in progress 2')
			io.to(socketId).emit('to lobby', false)
	    }
	})
}

const handleJoinLobby = (playerMap) => {
	let cookie = playerMap.get('cookie');
	let socketId = playerMap.get('socket_id');
	console.log(cookie)
	let newPlayerData = [cookie, socketId];
	let playerQ = "SELECT cookie cookie, socket_id socketid FROM players WHERE cookie = $1"
	pool.query(playerQ, [cookie], (error, results) => {
		if(error) {
			console.log(3)
	    	return console.error(error.message);
		}
		if(results.rows.length) {
			console.log("update player")
			let updateQ = "UPDATE players SET cookie = $1, socket_id = $2 WHERE cookie = $1"
			pool.query(updateQ, [cookie, socketId], (error, results) => {
				if(error) {
					console.log(4)
					return console.error(error.message);
				}
			})
    	} else {
    		console.log("new player")
    		let addPlayerQ = 'INSERT INTO players(cookie, socket_id) VALUES ($1,$2);'
    		pool.query(addPlayerQ, newPlayerData, (error, results) => {
    			if(error) {
    				console.log(5)
	    			return console.error(error.message);
				}
    		})
    	}
	})
}

module.exports = {
    handleJoinLobby,
    handleJoinGame,
}

