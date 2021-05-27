import './Lobby.css'
import ReactDOM from 'react-dom';
import React from "react";
import Game from "./Game"


var socket;

export class Lobby extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {value: 'James 1:19-21', lobbySize: 1};

	    this.handleChange = this.handleChange.bind(this);
    	this.handleSubmit = this.handleSubmit.bind(this);
    };

    handleChange(event) {
    	this.setState({value: event.target.value});
  	}

  	handleSubmit(event) {
    	event.preventDefault();
    	this.props.socket.emit('start game', this.state.value)
  	}

	componentDidMount() {
		socket = this.props.socket
		socket.emit('request lobby size')
		socket.on('update lobby size', (size) => {
			this.setState({
				value: this.state.value,
				lobbySize: size
			})
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
	render() {
		return (
        <div className="Lobby">
        	<div className="container py-4">
	        	<div className="d-flex justify-content-center">
			        <form onSubmit={this.handleSubmit}>
			        	<div className="col-xs-2 col-xs-offset-2">
			        		<div className="col-xs-2 col-xs-offset-2">
	        					<h1>Welcome to Room <strong>{this.props.roomId}</strong></h1>
	        					<h2> There are <strong>{this.state.lobbySize}</strong> players in the Lobby </h2>  
	        				</div>
						    <label>Select Verse</label>
						    <select value={this.state.value} onChange={this.handleChange} className="form-control">
						    	<option value='James 1:19-21'>James 1:19-21</option>
								<option value='Genesis 2:22-24'>Genesis 2:22-24</option>
								<option value='Matthew 5:14-16'>Matthew 5:14-16</option>
								<option value='Psalm 1:1-3'>Psalm 1:1-3</option>
								<option value='1 Corinthians 6:18-20'>1 Corinthians 6:18-20</option>
								<option value='1 Corinthians 10:31'>1 Corinthians 10:31</option>
								<option value='2 Peter 3:8-9'>2 Peter 3:8-9</option>
								<option value='1 Corinthians 13:4-8'>1 Corinthians 13:4-8</option>
								<option value='Matthew 7:21-23'>Matthew 7:21-23</option>
								<option value='Genesis 50:19-20'>Genesis 50:19-20</option>
								<option value='Matthew 16:16-18'>Matthew 16:16-18</option>
								<option value='Galatians 3:26-28'>Galatians 3:26-28</option>
								<option value='Galatians 6:9-10'>Galatians 6:9-10</option>
								<option value='Matthew 19:29-30'>Matthew 19:29-30</option>
								<option value='Nehemiah 1:5-6'>Nehemiah 1:5-6</option>
								<option value='1 Corinthians 15:58'>1 Corinthians 15:58</option>
								<option value='1 Corinthians 16:13-14'>1 Corinthians 16:13-14</option>
								<option value='Jude 1:24-25'>Jude 1:24-25</option>
								<option value='Psalm 27:4'>Psalm 27:4</option>
								<option value='1 Timothy 3:15'>1 Timothy 3:15</option>
								<option value='Mark 3:33-35'>Mark 3:33-35</option>
								<option value='1 Thessalonians 4:16-18'>1 Thessalonians 4:16-18</option>
								<option value='Mark 10:43-45'>Mark 10:43-45</option>
								<option value='Ecclesiastes 12:13-14'>Ecclesiastes 12:13-14</option>
								<option value='Proverbs 8:11-13'>Proverbs 8:11-13</option>
						    </select>
		            		<div className="col text-center">
		            			<button type="submit" className="btn btn-success" id="createButton">Start Game</button>
		            		</div>
	            		</div>
	            	</form>
            	</div>
		  	</div>
        </div>
        );
    }
}

export default Lobby;
