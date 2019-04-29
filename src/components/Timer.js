import React, { Component } from "react";
import {Container, Row, Col, Card, Button, Jumbotron, Spinner} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign, faMinus, faPlus, faFastForward } from '@fortawesome/free-solid-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import heartRaffle from "../heartRaffle";
import web3 from "../web3";
import TicketNumbers from "./TicketNumbers";

export default class Timer extends Component {
	state = {
		buyAmount: 5
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
		if(!this.state.EndTime){
			this.state.EndTime = parseInt(this.props.state.EndTime);
		}
		this.state.EndTime -= 1;
		this.setState(this.state);
	}

	render(){
		return(
			<div>
			<Jumbotron style={{padding: '1em'}}>
				<div >
					<h3 style={{display: 'inline-block'}}><Spinner type="grow" color="success" />Round {this.props.state.RoundNumber}</h3> &nbsp;
					<Button color="secondary"
						className="btn-sm"
						onClick={e => this.props.minusRound()}
					><FontAwesomeIcon icon={faMinus}/></Button> &nbsp;
					<Button color="secondary"
						className="btn-sm"
						onClick={e => this.props.plusRound()}
					><FontAwesomeIcon icon={faPlus}/></Button> &nbsp;
					<Button color="secondary"
						className="btn-sm"
						onClick={e => this.props.fetchRound()}
					><FontAwesomeIcon icon={faFastForward}/></Button>
				</div>
				<hr />
					<Row>
						<Col xs='3'>
							<h5>1st</h5>
						</Col>
						<Col xs='5'>
							<h5><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.WinnersBalance_First/(1e18)).toFixed(4)}</h5>
						</Col>
						<Col xs='4'>
							<h5><FontAwesomeIcon icon={faDollarSign}/> {(this.props.state.WinnersBalance_First/(1e18)*this.props.state.rateUSD).toFixed(2)}</h5>
						</Col>
					</Row>
					<Row>
						<Col xs='3'>
							<h5>2nd</h5>
						</Col>
						<Col xs='5'>
							<h5><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.WinnersBalance_Second/(1e18)).toFixed(4)}</h5>
						</Col>
						<Col xs='4'>
							<h5><FontAwesomeIcon icon={faDollarSign}/> {(this.props.state.WinnersBalance_Second/(1e18)*this.props.state.rateUSD).toFixed(2)}</h5>
						</Col>
					</Row>
					<Row>
						<Col xs='3'>
							<h5>3rd</h5>
						</Col>
						<Col xs='5'>
							<h5><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.WinnersBalance_Third/(1e18)).toFixed(4)}</h5>
						</Col>
						<Col xs='4'>
							<h5><FontAwesomeIcon icon={faDollarSign}/> {(this.props.state.WinnersBalance_Third/(1e18)*this.props.state.rateUSD).toFixed(2)}</h5>
						</Col>
					</Row>

					<Row>
						<div style={{margin: 'auto', padding: '1em'}}>
							<h1 id='countdown'>{this.secondsToTime(this.state.EndTime)}</h1>
						</div>
					</Row>
				<hr />

					<Row>
						<Col>
							<h3>Entries: {this.props.state.MyEntries} <TicketNumbers state={this.props.state}/></h3>					
						</Col>
					</Row>
				{this.displayAccount()}
			</Jumbotron>
			</div>
		);
	}

	minusBuy(){
		this.state.buyAmount -= 1;
		if(this.state.buyAmount < 1){
			this.state.buyAmount = 1;
		}
		this.setState(this.state);
	}

	plusBuy(){
		this.state.buyAmount += 1;
		this.setState(this.state);
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

		if(this.RoundIsOver()){
			if(this.props.state.Account == undefined){
				return (
					<div>Time is up, winners are being drawn.</div>
				);
			}
			if(this.props.state.WinnerTickets){
				return (
					<div>
						Winning tickets {this.props.state.WinnerTickets}
						<Row>
							<Col xs='3'>
								<h2>1st</h2>
							</Col>
							<Col xs='9'>
								<h2><a href={this.etherScanAddress(this.props.state.Winners[0])} target="_blank">{this.CutAddress(this.props.state.Winners[0])}</a></h2>
							</Col>
						</Row>
						<Row>
							<Col xs='3'>
								<h2>2nd</h2>
							</Col>
							<Col xs='9'>
								<h2><a href={this.etherScanAddress(this.props.state.Winners[1])} target="_blank">{this.CutAddress(this.props.state.Winners[1])}</a></h2>
							</Col>
						</Row>
						<Row>
							<Col xs='3'>
								<h2>3rd</h2>
							</Col>
							<Col xs='9'>
								<h2><a href={this.etherScanAddress(this.props.state.Winners[2])} target="_blank">{this.CutAddress(this.props.state.Winners[2])}</a></h2>
							</Col>
						</Row>
					</div>
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

		return (
			<div>
				<Row>
					<Col xs='12'>
						<h3>
							Account: <a href={this.etherScanAddress(this.props.state.Account)} target="_blank">{this.CutAddress(this.props.state.Account)}</a>
							<br />
						</h3>
					</Col>
				</Row>
				<hr />
						<Row>
							<Col xs='12'>
								<p hidden={!this.RoundIsOver()}>
									Purchase some tickets to kick off the next round!
								</p>
							</Col>
						</Row>
						<Row>
							<Col style={{textAlign:'center'}}>
								<Button className='btn-sm'
									color="success"
									onClick={e => this.minusBuy()}
								><FontAwesomeIcon icon={faMinus}/></Button>&nbsp;
								<Button className='btn-sm'
									color="success"
									onClick={e => this.buy(this.state.buyAmount)}
								>Buy {this.state.buyAmount} <FontAwesomeIcon icon={faEthereum}/> {(this.props.state.TICKET_PRICE/(1e18)*this.state.buyAmount).toFixed(3)}</Button>&nbsp;
								<Button className='btn-sm'
									color="success"
									onClick={e => this.plusBuy()}
								><FontAwesomeIcon icon={faPlus}/></Button>
							</Col>
						</Row>
						<Row>
							<Col xs='12'>
								<Button
									style={{marginTop: '1em'}}
									color="secondary"
									className='btn-block'
									disabled={this.HasZeroBalance()}
									onClick={e => this.withdraw()}
								>Withdraw <FontAwesomeIcon icon={faEthereum}/> {(this.props.state.MyBalance/(1e18)).toFixed(3)}</Button>
							</Col>
						</Row>
			</div>
		);
	}

	RoundIsOver(){
		if(this.props.state.EndTime <= 0){
			return true;
		}
		return false;
	}

	HasZeroBalance(){
		if(this.props.state.MyBalance <= 0){
			return true;
		}
		return false;
	}

	etherScanAddress(address){
		return "https://rinkeby.etherscan.io/address/"+address;
	}

	CutAddress(address){
		return (address).substring(0,6)+'...'+(address).substring((address).length-4);
	}
}

