import React, { Component } from "react";
import {Row, Col, Jumbotron, Card, CardBody, CardTitle, CardSubtitle, Spinner} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'

export default class TxFeed extends Component {

	constructor(props){
		super(props);
	}

	render(){
		return(
			<Jumbotron>
				<h1><Spinner type="grow" color="primary" />Recent TxFeed</h1>
				{this.GenerateFeed(5)}
			</Jumbotron>
		);
	}

	GenerateFeed(number){
		let count = 0;
		let index = 0;
		let Cards = [];
		while(count < number){
			if(this.props.state.TxFeed.result[index].value > 0){
				Cards.push(this.BuildCard(index));
				count += 1;
			}
			index += 1;
		}
		return Cards;
	}

	BuildCard(index){
		let tx = 'https://rinkeby.etherscan.io/tx/'+this.props.state.TxFeed.result[index].hash;
		let amount = this.props.state.TxFeed.result[index].value;
		let address = this.props.state.TxFeed.result[index].from;
		let color = 'blue';
		let action = 'Purchase';


		if(this.props.state.Contract.toLowerCase() === this.props.state.TxFeed.result[index].from){
			//Withdraw
			color = 'green';
			action = 'Withdraw';
		}

		if(this.props.state.TxFeed.result[index].isError == 1){
			//Error
			color = 'red';
		}

		return this.Card(tx, address, amount, action, color);
	}

	Card(tx, address, amount, action, color){
		return (
			<div style={{ borderLeft: '5px solid '+color }}>
				<Card>
					<CardBody>
						<CardTitle>
							<Row>
								<Col xs='6' sm='6' md='6' lg='6'>
									{action} 
								</Col>
								<Col xs='6' sm='6' md='6' lg='6'>
									<FontAwesomeIcon icon={faEthereum}/>{(amount/(1e18)).toFixed(4)}
								</Col>
							</Row>

						</CardTitle>
						<CardSubtitle><a href={tx} target="_blank">{address}</a></CardSubtitle>
					</CardBody>			
				</Card>
			</div>
		);
	}
}

