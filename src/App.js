import 'bootstrap/dist/css/bootstrap.css';
import React, { Component } from "react";
import web3 from "./web3";
import {Container, Row, Col, Card} from 'reactstrap'
import Timer from "./components/Timer";
import PercentBanner from "./components/PercentBanner";
import heartRaffle from "./heartRaffle";

class App extends Component {
	state = {
		RoundNumber: 0
	};

	//Bind our methods
	constructor(props){
		super(props);
		
		this.FetchValues();
	}

	//refresh every 5 seconds
	componentDidMount() {
	  this.interval = setInterval(() => this.FetchValues(), 15000);
	}

	componentWillUnmount() {
	  clearInterval(this.interval);
	}

	//Build our page
	render() {
		return (
			<div style={{width: '80%', margin: 'auto', paddingTop: '5em'}}>
				<Row>
					<Col xs='12' sm='12' md='3' lg='3'>

						<Timer state={this.state}/>
					</Col>
					<Col xs='12' sm='12' md='9' lg='9' style={{paddingLeft: '1em'}}>
						{new PercentBanner(this.state).build()}
					</Col>
				</Row>
			</div>
		);
	}

	//Get updated values from contract
	async FetchValues(){
		const accounts = await web3.eth.getAccounts();
		this.state.Account = accounts[0];

		//Round Number
		this.state.RoundNumber = parseInt(await heartRaffle.methods.GetRound().call({
			from: accounts[0]
		}));

		//Timers
		this.state.EndTime = parseInt(await heartRaffle.methods.GetEndTime(this.state.RoundNumber).call({
			from: accounts[0]
		}));
		this.state.DrawTime = parseInt(await heartRaffle.methods.GetDrawTime(this.state.RoundNumber).call({
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

		//Conversion
		this.state.rateUSD = await fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD")
			.then(res => res.json())
			.then(
				(result) => {
					return result.USD
				}
			)

		this.setState(this.state);
	}
}

export default App;
