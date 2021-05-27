import React from "react";

export class Lose extends React.Component {
	constructor(props) {
		super(props);
		this.reload = this.reload.bind(this);
	}

	reload(event) {
		window.location.reload();
	}

	render() {
		return (
        <div className="Lose">
        	<div className="jumbotron jumbotron-fluid">
        		<div className="container">
    				<h1 className="display-4">Keep Practicing! 加油！</h1>
    				<hr className="my-4"></hr>
    				<p className="lead">
    					The Verse is: {this.props.correctVerse}
  					</p>
  					<p className="lead">
    					<button className="btn btn-warning" onClick={this.reload}>Play Again</button>
  					</p>
  				</div>
        	</div>
		</div>
        );
    }
}

export default Lose;
