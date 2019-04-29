import React, { Component } from "react"
import { Jumbotron, Button, Row, Col, Input, InputGroup, InputGroupAddon, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
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
		voteAmount: 0,
		voteCharity: {
			'owner': "0xaEA6A47B413AF8856cA7a05FB0A88257928AE377",
			'name' : 'Developers ;)',
			'url' : 'https://google.com',
			'votes' : 0
		},
		errorMessage: "",
		modal: false,
		registerName: "",
		registerUrl: "" 
	}

	constructor(props){
		super(props);
		this.register = this.register.bind(this);
		this.toggle = this.toggle.bind(this);
	}

	toggle() {
		this.setState(prevState => ({
			modal: !prevState.modal
		}));
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
				<Col style={{textAlign:'center'}} className='offset-md-3' xs='6'>

						<p>Voting for <a href={this.state.voteCharity.url} target='_blank'>{this.state.voteCharity.name}</a></p>
						<p style={{color:'red'}}>{this.state.errorMessage}</p>
						<InputGroup>
							<Input placeholder="Charity Address..." onChange={e => this.changeCharity(e)}/>
						</InputGroup>

						<br />
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
							onClick={e => this.vote()}
						>Vote {this.state.voteAmount} <FontAwesomeIcon icon={faVoteYea}/>  ({this.props.state.MyVotingBalance} available)</Button>&nbsp;
						<Button className='btn-sm'
							color="success"
							disabled={this.IsValidAddress()}
							onClick={e => this.plusVote()}
						><FontAwesomeIcon icon={faPlus}/></Button>
						<br />
						<br />
						<Button className='btn-sm'
							color="secondary"
							onClick={e => this.toggle()}
						>Register Charity</Button>
						{this.buildModal()}

			</Col></Row>
		);
	}

	async vote(){
		try{
			await heartRaffle.methods.vote(this.state.voteCharity.owner, this.state.voteAmount, this.props.state.RoundNumber).send({
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
		if(this.state.voteAmount < 0){
			this.state.voteAmount = 0;
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

	submitName(event){
		this.setState({
			registerName: event.target.value
		});
	}
	submitUrl(event){
		this.setState({
			registerUrl: event.target.value
		});
	}

	async register(){
		try{
			await heartRaffle.methods.register(this.state.registerName, this.state.registerUrl).send({
				from: this.props.state.Account,
			});
			this.toggle();
		}catch(err){
                        alert(err.message);
		}
	}

	buildModal(){
		return(
			<Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
				<Form>
					<ModalHeader toggle={this.toggle}>Register Charity</ModalHeader>
					<ModalBody>
						<p>The submitting address will collect all donations and winnings. Re-Registering with the same address will overwrite the name and url but not your balance.</p>
						<FormGroup>
							<Label for="name">Name</Label>
							<Input type="text" name="name" id="name" placeholder="Children's Hospital" onChange={e => this.submitName(e)} />
						</FormGroup>
						<FormGroup>
							<Label for="url">Url</Label>
							<Input type="text" name="url" id="url" placeholder="Please use this url to host your address" onChange={e => this.submitUrl(e)} />
						</FormGroup>
					</ModalBody>
					<ModalFooter>
						<Button color="secondary" onClick={this.toggle}>Close</Button>
						<Button color="success" onClick={this.register}>Register</Button>
					</ModalFooter>
				</Form>
			</Modal>
		);
	}
}

