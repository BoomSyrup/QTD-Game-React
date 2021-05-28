import './Home.css';
import ReactDOM from 'react-dom';
import React from "react";
import Lobby from "./Lobby"
import Game from "./Game"
import { io } from "socket.io-client";
const socket = io();

export class Home extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {
	    	room: "Room",
	    	name: "Name",
	    	error: ""
    };
    this.handleSubmitJoin = this.handleSubmitJoin.bind(this);
    this.handleSubmitCreate = this.handleSubmitCreate.bind(this);
    this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		socket.on('cookie', (cookie) => {
    		document.cookie = cookie;
    	});
    	socket.on('room created', (roomId) => {
    		const name = this.state.name
    		if(!(name.length > 32 || name.length == 0)) {
    			socket.emit('add player',{name:name, room:roomId, cookie: document.cookie, socketId: socket.id})
	    	}
	    	socket.emit("create", {name:name, room:roomId, cookie: document.cookie, socketId: socket.id})
	    	ReactDOM.render(
			  <React.StrictMode>
			    <Lobby socket = {socket} roomId = {roomId}/>
			  </React.StrictMode>,
			  document.getElementById('root')
			);
	    })
	    socket.on('to lobby',(go)=> {
	    	if(go) {
	    		ReactDOM.render(
				  <React.StrictMode>
				    <Lobby socket = {socket} roomId = {this.state.room}/>
				  </React.StrictMode>,
				  document.getElementById('root')
				);
	    	} else {
	    		this.setState({
	    			error: <div class="alert alert-danger" role="alert"> Room does not exist or is not available</div>
	    		})
	    	}
	    })
	    socket.on('go to game', () => {
			ReactDOM.render(
			  	<React.StrictMode>
			    	<Game socket = {socket}/>
			  	</React.StrictMode>,
			  	document.getElementById('root')
			);
		})
	}	

    handleChange(event) {
    	const target = event.target;
    	const value = target.value || '';
    	const name = target.name;
    	this.setState({
  			[name]: value
		});
  	};

  	handleSubmitJoin(event) {
    	const name = this.state.name
    	const roomId = this.state.room
    	if(!(name.length > 32 || name.length == 0 || roomId.length != 4)) {
    		socket.emit('add player',{name:name, room:roomId, cookie: document.cookie, socketId: socket.id})
    	}
    	socket.emit("join", roomId, {name:name, room:roomId, cookie: document.cookie, socketId: socket.id})
    	event.preventDefault();
  	}

  	handleSubmitCreate(event) {
  		console.log(socket.id)
    	socket.emit("create room")
    	event.preventDefault();
  	}

	render() {
		function BadName(name) {
			if(name.length > 32 || name.length == 0) {
				return <p className="text-danger"> Your name must be less than 32 characters </p>;
			}
		}
		function BadRoom(room) {
			if(room.length != 4) {
				return <p className="text-danger"> Your room name must be 4 characters </p>;
			}
		}
		return (
        <div className="Home">
            <div className="container py-4">
            	{this.state.error}
                <h1 className="text-center"> Welcome to the QTD Game </h1> 
                <h2 className="text-center"> Players in the game </h2>
                <div className="d-flex justify-content-center">
	                <div className="col-xs-2 col-xs-offset-4">
		                <form onSubmit={this.handleSubmitJoin}>
		                	<div className="input-group">
		                		<input type="text" value={this.state.name} onChange={this.handleChange} className="form-control" name="name"></input>
		                	</div>
		                	{BadName(this.state.name)}
		                	<div className="input-group mb-3">
	  							<input type="text" value={this.state.room} onChange={this.handleChange} className="form-control" name="room"></input>
		                		<button className="btn btn-outline-secondary" type="submit">Join Room</button>
		                	</div>
		                	{BadRoom(this.state.room)}
		                </form>
		                <form onSubmit={this.handleSubmitCreate}>
		                	<div className="input-group mb-3">
			                		<div className="col text-center">
			                			<button type="submit" className="btn btn-success">Create Room</button>
			                		</div>
		                	</div>
	                	</form>
                	</div>
	            </div>
            </div>
        </div>
        );
    }
}

export default Home;
