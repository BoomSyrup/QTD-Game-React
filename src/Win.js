import React from "react";

export class Win extends React.Component {
	constructor(props) {
		super(props);
		this.reload = this.reload.bind(this);
	}

	reload(event) {
		window.location.reload();
	}

	render() {
		return (
        <div className="Win">
        	<div className="jumbotron jumbotron-fluid">
        		<div className="container">
    				<h1 className="display-4">Wow big brain 🧠</h1>
    				<hr className="my-4"></hr>
    				<p className="lead">
    					{this.props.correctVerse}
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

export default Win;
