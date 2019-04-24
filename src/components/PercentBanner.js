import React, { Component } from "react";
import {Container, Row, Col, Card} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faHandHoldingHeart, faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'

export default class PercentBanner extends Component {
	state = {

	};

	constructor(props){
		super(props);
	}

	render(){
		return(
			<div>
				<Row>
					<div style={{margin: 'auto', paddingBottom: '2em'}}>
						<h3>Total Round Balance:  <FontAwesomeIcon icon={faEthereum}/> {(this.props.state.RoundBalance/(1e18)).toFixed(4)}</h3>
					</div>
				</Row>
				<Row>
					<Col xs='12' sm='12' md='4' lg='4'>
						{this.BuildPlayerCard()}
					</Col>
					<Col xs='12' sm='12' md='4' lg='4'>
						{this.BuildCharityCard()}
					</Col>
					<Col xs='12' sm='12' md='4' lg='4'>
						{this.BuildDevelopersCard()}
					</Col>
				</Row>
		  	</div>
		);
	}

	//Player
	BuildPlayerCard(){
		return(
			<div style={{textAlign: 'center'}}>
				<FontAwesomeIcon icon={faUser} size='5x'/>
				<h3>Players {this.props.state.PLAYER_POT}%</h3>
				<h5><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.PlayerBalance/(1e18)).toFixed(4)}</h5>
			</div>
		);
	}

	//Charity
	BuildCharityCard(){
		return(
			<div style={{textAlign: 'center'}}>
				<FontAwesomeIcon icon={faHandHoldingHeart} size='5x'/>
				<h3>Charity {this.props.state.CHARITY_POT}%</h3>
				<h5><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.CharityBalance/(1e18)).toFixed(4)}</h5>
			</div>
		);
	}

	//Developer
	BuildDevelopersCard(){
		return(
			<div style={{textAlign: 'center'}}>
				<FontAwesomeIcon icon={faLayerGroup} size='5x'/>
				<h3>Developers {this.props.state.DEVELOPER_POT}%</h3>
				<h5><FontAwesomeIcon icon={faEthereum}/> {(this.props.state.DeveloperBalance/(1e18)).toFixed(4)}</h5>
			</div>
		);
	}
}
