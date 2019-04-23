import React, { Component } from "react";
import {Container, Row, Col, Card, Button, Jumbotron, Spinner} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign } from '@fortawesome/free-solid-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import heartRaffle from "../heartRaffle";
import web3 from "../web3";

export default class Timer extends Component {
	state = {
		
	};

	constructor(props){
		super(props);
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
							<h2><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.WinnersBalance_First/(1e18)).toFixed(4)}</h2>
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
							<h2><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.WinnersBalance_Second/(1e18)).toFixed(4)}</h2>
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
							<h2><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.WinnersBalance_Third/(1e18)).toFixed(4)}</h2>
						</Col>
						<Col xs='4'>
							<h2><FontAwesomeIcon icon={faDollarSign}/> {(this.props.state.WinnersBalance_Third/(1e18)*this.props.state.rateUSD).toFixed(2)}</h2>
						</Col>
					</Row>
				<hr />
					{this.displayAccount()}
			</Jumbotron>
		);
	}

	async buy(amount){
		let cost = ""+(this.props.state.TICKET_PRICE/(1e18)*amount);
		try{
			await heartRaffle.methods.buy().send({
				from: this.props.state.Account,
				value: web3.utils.toWei(cost, "ether")
			});
		}catch(err){
			alert(err.message);
		}
	}

	async withdraw(){
		try{
			await heartRaffle.methods.withdraw().send({
				from: this.props.state.Account,
			});
		}catch(err){
			alert(err.message);
		}
	}

	async drawWinners(){
		try{
			await heartRaffle.methods.drawWinners(this.props.state.RoundNumber).send({
				from: this.props.state.Account,
			});
		}catch(err){
			alert(err.message);
		}
	}

	secondsToTime(seconds){
		var seconds = parseInt(seconds, 10);

		if(seconds <= 0){
			if(this.props.state.Account == undefined){
				return (
					<div>Time is up, winners are being drawn.</div>
				);
			}
			return (
				<Button 
					color="danger"
					className='btn-block'
					onClick={e => this.drawWinners()}
					>Draw Winners!</Button>
			);
		}

		var days = Math.floor(seconds / (3600*24));
		seconds  -= days*3600*24;
		var hrs   = Math.floor(seconds / 3600);
		seconds  -= hrs*3600;
		var mnts = Math.floor(seconds / 60);
		seconds  -= mnts*60;

		return days+":"+hrs+":"+mnts+":"+seconds
	}

	displayAccount(){
		if(this.props.state.Account == undefined){
			return (
				<div>Please log into metamask or another wallet provider to interact with Heart Raffle.</div>
			);
		}

		let etherScan = "https://rinkeby.etherscan.io/address/"+this.props.state.Account;
		return (
			<div>
				<Row>
					<Col xs='12'>
						<h2>
							Account: <a href={etherScan} target="_blank">{this.CutAddress(this.props.state.Account)}</a>
							<br />
							Entries: {this.props.state.MyEntries}
						</h2>
					</Col>
				</Row>
				<Row>
					<Col xs='12'>
						<Row>
							<Col xs='12' sm='12' md='4' lg='4'>
								<Button className=''
									color="primary"
									onClick={e => this.buy(1)}
								>Buy 1 <FontAwesomeIcon icon={faEthereum}/> {(this.props.state.TICKET_PRICE/(1e18)).toFixed(3)}</Button>
							</Col>
							<Col xs='12' sm='12' md='4' lg='4'>
								<Button className=''
									color="primary"
									onClick={e => this.buy(5)}
								>Buy 5 <FontAwesomeIcon icon={faEthereum}/> {(this.props.state.TICKET_PRICE/(1e18)*5).toFixed(3)}</Button>
							</Col>
							<Col xs='12' sm='12' md='4' lg='4'>
								<Button className=''
									color="primary"
									onClick={e => this.buy(10)}
								>Buy 10 <FontAwesomeIcon icon={faEthereum}/> {(this.props.state.TICKET_PRICE/(1e18)*10).toFixed(3)}</Button>
							</Col>
						</Row>
						<Button
							style={{marginTop: '1em'}}
							color="success"
							className='btn-block'
							onClick={e => this.withdraw()}
							>Withdraw <FontAwesomeIcon icon={faEthereum}/> {(this.props.state.MyBalance/(1e18)).toFixed(3)}</Button>
					</Col>
				</Row>
			</div>
		);
	}

	CutAddress(address){
		return (address).substring(0,6)+'...'+(address).substring((address).length-4);
	}
}

