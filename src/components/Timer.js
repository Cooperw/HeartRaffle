import React, { Component } from "react";
import {Container, Row, Col, Card, Button, Jumbotron, Spinner} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'

export default class Timer extends Component {
	state = {
		
	};

	constructor(props){
		super(props);


	}

	async rateUSD() {
		await fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD")
			.then(res => res.json())
			.then(
				(result) => {
					return result.USD
				}
			)
	}

	//refresh every 5 seconds
	componentDidMount() {
	  this.countdown = setInterval(() => this.CountDown(), 1000);
	}

	componentWillUnmount() {
	  clearInterval(this.countdown);
	}

	CountDown(){
		if(!this.state.DrawTime){
			this.state.DrawTime = parseInt(this.props.state.DrawTime);
		}
		this.state.DrawTime -= 1;
		this.setState(this.state);
	}

	render(){
		console.log(JSON.stringify(this.state))
		return(
			<Jumbotron>
				<h1><Spinner type="grow" color="success" />Round {this.props.state.RoundNumber}</h1>
				<div style={{margin: 'auto', padding: '1em'}}>
					<h1 id='countdown'>{this.secondsToTime(this.state.DrawTime)}</h1>
				</div>
				<hr />
					<Row>
						<Col xs='3'>
							<h2>1st</h2>
						</Col>
						<Col xs='5'>
							<h2><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.WinnersBalance_First/(1e18)).toFixed(6)}</h2>
						</Col>
						<Col xs='4'>
							<h2><FontAwesomeIcon icon={faDollarSign}/> {(this.props.state.WinnersBalance_First/(1e18)*this.props.state.rateUSD).toFixed(2)}</h2>
						</Col>
					</Row>
					<Row>
						<Col xs='3'>
							<h2>2nd</h2>
						</Col>
						<Col xs='5'>
							<h2><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.WinnersBalance_Second/(1e18)).toFixed(6)}</h2>
						</Col>
						<Col xs='4'>
							<h2><FontAwesomeIcon icon={faDollarSign}/> {(this.props.state.WinnersBalance_Second/(1e18)*this.props.state.rateUSD).toFixed(2)}</h2>
						</Col>
					</Row>
					<Row>
						<Col xs='3'>
							<h2>3rd</h2>
						</Col>
						<Col xs='5'>
							<h2><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.WinnersBalance_Third/(1e18)).toFixed(6)}</h2>
						</Col>
						<Col xs='4'>
							<h2><FontAwesomeIcon icon={faDollarSign}/> {(this.props.state.WinnersBalance_Third/(1e18)*this.props.state.rateUSD).toFixed(2)}</h2>
						</Col>
					</Row>
				<hr />
					<Row>
						<Col xs='12'>
							<h2>
								Account: {(""+this.props.state.Account).substring(0,6)}...{(""+this.props.state.Account).substring((""+this.props.state.Account).length-4)}
								<br />
								Entries: {this.props.state.MyEntries}
							</h2>
						</Col>
					</Row>
					<Row>
						<Col xs='12'>
							<Button className='btn-block'
								onClick={e => this.buy()}
								>Buy <FontAwesomeIcon icon={faEthereum}/> {(this.props.state.TICKET_PRICE/(1e18)).toFixed(3)}</Button>
							<Button 
								color="success"
								className='btn-block'
								onClick={e => this.withdraw()}
								>Withdraw <FontAwesomeIcon icon={faEthereum}/> {(this.props.state.MyBalance/(1e18)).toFixed(3)}</Button>
						</Col>
					</Row>
			</Jumbotron>
		);
	}

	buy(){
		alert('buy');
	}

	withdraw(){
		alert('withdraw')
	}

	secondsToTime(seconds){
		var seconds = parseInt(seconds, 10);

		if(seconds <= 0){
			return "Draw Winners!";
		}

		var days = Math.floor(seconds / (3600*24));
		seconds  -= days*3600*24;
		var hrs   = Math.floor(seconds / 3600);
		seconds  -= hrs*3600;
		var mnts = Math.floor(seconds / 60);
		seconds  -= mnts*60;

		return days+":"+hrs+":"+mnts+":"+seconds
	}
}
