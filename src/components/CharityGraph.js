import React, { Component } from "react"
import { Jumbotron, Button, Row, Col, Input, InputGroup, InputGroupAddon } from 'reactstrap'
import { BarChart } from "react-d3-components"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faPlus, faVoteYea } from '@fortawesome/free-solid-svg-icons'
import heartRaffle from "../heartRaffle";
import web3 from "../web3";

export default class CharityGraph extends Component {

	state = {
		data: [{
			label: 'Charity Votes',
			values: []
		}],
		voteAmount: 1,
		voteCharity: {
			'owner': "0xaEA6A47B413AF8856cA7a05FB0A88257928AE377",
			'name' : 'Developers ;)',
			'url' : 'https://google.com',
			'votes' : 0
		},
		errorMessage: ""
	}

	constructor(props){
		super(props);
	}

	render(){
		if(this.props.state.RoundCharities){
			this.poolData();
                }
		if(this.state.data[0].values.length === 0){
			this.buildDemoData();
		}
		return(
			<div style={{textAlign:'center'}}>
				<BarChart
					data={this.state.data}
					width='100%'
					height={500}
					width={600}
					margin={{top: 10, bottom: 50, left: 50, right: 10}}/>
				{this.GenerateButtons()}
			</div>
		);
	}

	GenerateButtons(){
		return (
			<Row>
				<Col style={{textAlign:'center'}}>
					<Row>
						<Col>
							<p>Voting for <a href={this.state.voteCharity.url} target='_blank'>{this.state.voteCharity.name}</a></p>
							<p style={{color:'red'}}>{this.state.errorMessage}</p>
							<InputGroup>
								<Input placeholder="Charity Address..." onChange={e => this.changeCharity(e)}/>
							</InputGroup>
						</Col>
					</Row>
					<Button className='btn-sm'
						style={{display:'inline-block'}}
						color="success"
						disabled={this.IsValidAddress()}
						onClick={e => this.minusVote()}
					><FontAwesomeIcon icon={faMinus}/></Button>&nbsp;
					<Button className='btn-sm'
						style={{display:'inline-block'}}
						color="success"
						disabled={this.IsValidAddress()}
						onClick={e => this.Vote()}
					><FontAwesomeIcon icon={faVoteYea}/> Vote {this.state.voteAmount} ({this.props.state.MyVotingBalance} available)</Button>&nbsp;
					<Button className='btn-sm'
						color="success"
						disabled={this.IsValidAddress()}
						onClick={e => this.plusVote()}
					><FontAwesomeIcon icon={faPlus}/></Button>
			</Col></Row>
		);
	}

	async Vote(){
		try{
			await heartRaffle.methods.vote(this.state.voteCharity, this.state.voteAmount, this.props.state.RoundNumber).send({
				from: this.props.state.Account,
			});
		}catch(err){
                        alert(err.message);
		}
	}

	async changeCharity(e){
		let address = e.target.value;
		this.state.errorMessage = "";
		try{
			this.state.voteCharity = {
				'owner': address,
				'name' : await heartRaffle.methods.GetCharityName(address).call({from: this.props.state.Address}),
				'url' : await heartRaffle.methods.GetCharityUrl(address).call({from: this.props.state.Address}),
				'votes' : parseInt(await heartRaffle.methods.GetCharityRoundBalance(this.props.state.RoundNumber, address).call({from: this.props.state.Address}))
			};
			if(!this.state.voteCharity.name.length){					
				this.state.errorMessage = "Charity not registered";
			}
			this.setState(this.state);
		}catch(err){
			this.state.errorMessage = "Bad Address";
			this.setState(this.state);
		}
	}

	minusVote(){
		this.state.voteAmount -= 1;
		if(this.state.voteAmount < 1){
			this.state.voteAmount = 1;
		}
		this.setState(this.state);
	}

	plusVote(){
		this.state.voteAmount += 1;
		if(this.state.voteAmount > this.props.state.MyVotingBalance){
			this.state.voteAmount = this.props.state.MyVotingBalance;
		}
		this.setState(this.state);
	}

	IsValidAddress(){
		return this.state.errorMessage
	}

	poolData(){
		this.state.data[0].values = [];
		for (let charity of this.props.state.RoundCharities){
			this.state.data[0].values.push(
				{
					'x': charity.name+';;'+charity.url,
					'y': (charity.votes/this.props.state.VotingQuantity)
				}
			);
		}
	}

	buildDemoData(){
		this.state.data[0].values = [
				{'x':'Demo 1','y':10},
				{'x':'Demo 2','y':8},
				{'x':'Demo 3','y':6},
				{'x':'Demo 4','y':4},
				{'x':'Demo 5','y':2}
			]
	}
}

