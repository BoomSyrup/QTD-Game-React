import ReactDOM from 'react-dom';
import React from "react";
import Win from "./Win"
import Lose from "./Lose"
import './Game.css'

var socket;

export class Game extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {lives: 0, verseLoc: "", runningVerse: [], vocab: [], progress: "", error: ""};

    	this.handleClick = this.handleClick.bind(this);
    };

	handleClick(event) {
		socket.emit('guess', event.target.value)
    	event.preventDefault();
  	}

	componentDidMount() {
		socket = this.props.socket
		socket.emit('request game data')
		socket.on('game data', (data) => {
			console.log('this is data')
	  		console.log(data)
	  		let vocab
	  		let error = ""
	  		//adjust for mobile phone
	  		if(window.innerWidth < 1000){
	  			vocab = data.vocab.map((word, i) =>
	    		<button key={i} value={word} className="btn btn-sm" onClick={this.handleClick} style={{backgroundColor: "#16a89d", color: "white"}}>{word}</button>
	  			);
			    
	  		} else {
	  			vocab = data.vocab.map((word, i) =>
	    		<button key={i} value={word} className="btn" onClick={this.handleClick} style={{backgroundColor: "#16a89d", color: "white"}}>{word}</button>
	  			);
	  		}	

	  		const partial = ((data.runningVerse.length / data.length) * 100).toString();
	  		const progressBar = <div className="progress">
  									<div className="progress-bar progress-bar-animated" role="progressbar" aria-valuenow={partial} aria-valuemin="0" aria-valuemax="100" style={{width: partial + '%', backgroundColor: "#9ed8d3"}}></div>
								</div>
			if(data.error != "") {
				error = <div className="alert alert-danger d-inline-flex" role="alert"> {data.error} </div>
			}
			this.setState({
	    		lives: data.lives,
	    		verseLoc: data.verseLoc,
	    		runningVerse: data.runningVerse,
	    		vocab: vocab,
	    		progress: progressBar,
	    		error: error
	    	})
		})
		socket.on('game over', (win, correctVerse)=> {
			if(win) {
				ReactDOM.render(
				  	<React.StrictMode>
				    	<Win correctVerse={correctVerse}/>
				  	</React.StrictMode>,
				  	document.getElementById('root')
				);
			} else {
				ReactDOM.render(
				  	<React.StrictMode>
				    	<Lose correctVerse={correctVerse}/>
				  	</React.StrictMode>,
				  	document.getElementById('root')
				);
			}
		})
	}	
	render() {
		return (
	    <div className="Game">
	   	<div className="text-center" id="errorNotif">
		</div>
	    	<div className="container">
	 			<div id="topBarDiv">
	 				<div className="row text-center">
	        			<div className="col text-left topBarText"> <h3 className="lead"> {this.state.lives} Lives </h3> </div>
	        			<div className="col text-right topBarText"> <h3 className="lead">{this.state.verseLoc} </h3> </div>
	        		</div>
	 				<p id="run">{this.state.runningVerse.join(" ")}</p>		
	 			</div>
	 		</div>
	 		<div className="container py-4 fixed-bottom">
	 			{this.state.progress}
	   			<div className="container text-center">
					{this.state.vocab}	
	   			</div>
		  	</div>
	    </div>
        );
    }
}

export default Game;

