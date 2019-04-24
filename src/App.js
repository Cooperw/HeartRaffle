import 'bootstrap/dist/css/bootstrap.css';
import React, { Component } from "react";
import {Container, Row, Col, Card, Button} from 'reactstrap'
import web3 from "./web3";
import heartRaffle from "./heartRaffle";
import Timer from "./components/Timer";
import PercentBanner from "./components/PercentBanner";
import LoadingScreen from "./components/LoadingScreen";
import RecentWinners from "./components/RecentWinners";
import TxFeed from "./components/TxFeed";
import CharityGraph from "./components/CharityGraph";

class App extends Component {
	state = {
		RoundNumber: null
	};

	//Bind our methods
	constructor(props){
		super(props);
		this.FetchRound();

		this.minusRound = this.minusRound.bind(this);
		this.plusRound = this.plusRound.bind(this);
	}

	//refresh every 5 seconds
	componentDidMount() {
	  this.interval = setInterval(() => this.FetchValues(), 1000);
	}

	componentWillUnmount() {
	  clearInterval(this.interval);
	}

	//Build our page
	render() {
		if(this.state.RoundNumber == null || this.state.PLAYER_POT == null){
			return (
				<LoadingScreen />
			);
		}
		return (
			<div style={{width: '90%', margin: 'auto', paddingTop: '5em'}}>
				<Row>
					<Col xs='12' sm='12' md='3' lg='3'>
						<Timer state={this.state}
							fetchRound={this.FetchRound}
							minusRound={this.minusRound}
							plusRound={this.plusRound}/>
						<TxFeed state={this.state} />
					</Col>
					<Col xs='12' sm='12' md='9' lg='9' style={{paddingLeft: '1em'}}>
						<PercentBanner state={this.state} />
					</Col>
				</Row>
			</div>
		);
	}

	async FetchRound(){
		const accounts = await web3.eth.getAccounts();
		this.state.Account = accounts[0];

		//Round Number
		this.state.RoundNumber = parseInt(await heartRaffle.methods.GetRound().call({
			from: accounts[0]
		}));

		this.setState(this.state);
	}

	plusRound(){
		this.state.RoundNumber += 1;
		this.setState(this.state);
	}

	minusRound(){
		this.state.RoundNumber -= 1;
		this.setState(this.state);
	}

	//Get updated values from contract
	async FetchValues(){

		const accounts = await web3.eth.getAccounts();
		this.state.Account = accounts[0];

		//Contract Address
		this.state.Contract = heartRaffle.address;


		//Protect again null contract
		if(this.state.RoundNumber == null){
			return;
		}

		//Timers
		this.state.EndTime = parseInt(await heartRaffle.methods.GetEndTime(this.state.RoundNumber).call({
			from: accounts[0]
		}));

		//Percentages
		this.state.PLAYER_POT = parseInt(await heartRaffle.methods.WINNERS_POT().call({
			from: accounts[0]
		}));
		this.state.CHARITY_POT = parseInt(await heartRaffle.methods.CHARITY_POT().call({
			from: accounts[0]
		}));
		this.state.DEVELOPER_POT = parseInt(await heartRaffle.methods.DEVELOPER_POT().call({
			from: accounts[0]
		}));
		this.state.TICKET_PRICE = parseInt(await heartRaffle.methods.TICKET_PRICE().call({
			from: accounts[0]
		}));

		//Pot Values
		this.state.RoundBalance = parseInt(await heartRaffle.methods.GetRoundBalance(this.state.RoundNumber).call({
			from: accounts[0]
		}));
		this.state.PlayerBalance = parseInt(await heartRaffle.methods.GetRoundPlayerBalance(this.state.RoundNumber).call({
			from: accounts[0]
		}));
		this.state.CharityBalance = parseInt(await heartRaffle.methods.GetRoundCharityBalance(this.state.RoundNumber).call({
			from: accounts[0]
		}));
		this.state.DeveloperBalance = parseInt(await heartRaffle.methods.GetRoundDeveloperBalance(this.state.RoundNumber).call({
			from: accounts[0]
		}));

		//Round winners and balances
		this.state.Winners = await heartRaffle.methods.GetRoundWinners(this.state.RoundNumber).call({
			from: accounts[0]
		});
		this.state.WinnerTickets = await heartRaffle.methods.GetRoundWinnerTickets(this.state.RoundNumber).call({
			from: accounts[0]
		});
		this.state.WinnersBalance_First = parseInt(await heartRaffle.methods.GetRoundWinnerBalance(this.state.RoundNumber, 0).call({
			from: accounts[0]
		}));
		this.state.WinnersBalance_Second = parseInt(await heartRaffle.methods.GetRoundWinnerBalance(this.state.RoundNumber, 1).call({
			from: accounts[0]
		}));
		this.state.WinnersBalance_Third = parseInt(await heartRaffle.methods.GetRoundWinnerBalance(this.state.RoundNumber, 2).call({
			from: accounts[0]
		}));

		//Round entries and my balance
		this.state.MyBalance = parseInt(await heartRaffle.methods.GetMyBalance().call({
			from: accounts[0]
		}));
		this.state.MyEntries = parseInt(await heartRaffle.methods.GetMyEntries(this.state.RoundNumber).call({
			from: accounts[0]
		}));
		this.state.MyTickets = await heartRaffle.methods.GetMyTicketNumbers(this.state.RoundNumber).call({
			from: accounts[0]
		});

		//Conversion
		this.state.rateUSD = await fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD")
			.then(res => res.json())
			.then(
				(result) => {
					return result.USD
				}
			)

		//TxFeed
		this.state.TxFeed = await fetch("http://api-rinkeby.etherscan.io/api?module=account&action=txlist&address="
				+this.state.Contract
				+"&startblock=0&endblock=99999999&sort=desc&apikey=8CCPKEI9M6M9RFIZ4MJUNDQGIUH1R6XACF")
			.then(res => res.json())
			.then(
				(result) => {
					return result
				}
			)

		this.setState(this.state);
	}
}

export default App;
