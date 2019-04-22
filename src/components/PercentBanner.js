import React, { Component } from "react";
import {Container, Row, Col, Card} from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faHandHoldingHeart, faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'

export default class PercentBanner extends Component {

	constructor(props){
		super(props);
		this.BuildPlayerCard = this.BuildPlayerCard.bind(this);
		this.BuildCharityCard = this.BuildCharityCard.bind(this);
		this.BuildDevelopersCard = this.BuildDevelopersCard.bind(this);
	}

	build(){
		return(
			<div>
				<Row>
					<div style={{margin: 'auto', paddingBottom: '2em'}}>
						<h1>Total Round Balance:  <FontAwesomeIcon icon={faEthereum}/> {(this.props.RoundBalance/(1e18)).toFixed(6)}</h1>
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
				<FontAwesomeIcon icon={faUser} size='9x'/>
				<h1>Players {this.props.PLAYER_POT}%</h1>
				<h3><FontAwesomeIcon icon={faEthereum}/> {(this.props.PlayerBalance/(1e18)).toFixed(6)}</h3>
			</div>
		);
	}

	//Charity
	BuildCharityCard(){
		return(
			<div style={{textAlign: 'center'}}>
				<FontAwesomeIcon icon={faHandHoldingHeart} size='9x'/>
				<h1>Charity {this.props.CHARITY_POT}%</h1>
				<h3><FontAwesomeIcon icon={faEthereum}/> {(this.props.CharityBalance/(1e18)).toFixed(6)}</h3>
			</div>
		);
	}

	//Developer
	BuildDevelopersCard(){
		return(
			<div style={{textAlign: 'center'}}>
				<FontAwesomeIcon icon={faLayerGroup} size='9x'/>
				<h1>Developers {this.props.DEVELOPER_POT}%</h1>
				<h3><FontAwesomeIcon icon={faEthereum}/> {(this.props.DeveloperBalance/(1e18)).toFixed(6)}</h3>
			</div>
		);
	}
}
