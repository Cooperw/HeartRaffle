import React, { Component } from "react";
import {Row, Col, Jumbotron} from 'reactstrap'

export default class RecentWinners extends Component {

	constructor(props){
		super(props);
	}

	render(){
		return(
			<Jumbotron>
				<h1>Round {this.props.state.RoundNumber-1}</h1>
				{this.WinnerRow(0)}
				{this.WinnerRow(1)}
				{this.WinnerRow(2)}
			</Jumbotron>
		);
	}

	WinnerRow(number){
		return(
			<Row>
				{(""+this.props.state.LastWinners[number]).substring(0,6)}...{(""+this.props.state.LastWinners[number]).substring((""+this.props.state.LastWinners[number]).length-4)}
			</Row>
		);
	}
}

