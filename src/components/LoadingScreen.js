import React, { Component } from "react";
import {Spinner} from 'reactstrap'

export default class LoadingScreen extends Component {
	constructor(props){
		super(props);
	}

	render(){
		return(
			<div style={{margin: 'auto', textAlign:'center', paddingTop: '20rem'}}>
				<Spinner color="success" style={{ width: '6rem', height: '6rem' }} />
				<h1>Crunching the latest numbers.</h1>
			</div>
		);
	}
}

