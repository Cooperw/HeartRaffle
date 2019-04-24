import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTicketAlt } from '@fortawesome/free-solid-svg-icons'

class TicketNumbers extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			modal: false
		};

		this.toggle = this.toggle.bind(this);
	}

	toggle() {
		this.setState(prevState => ({
			modal: !prevState.modal
		}));
	}

	render() {
		return (
			<div style={{display: 'inline-block'}}>
				<a href="#" onClick={this.toggle}><FontAwesomeIcon icon={faTicketAlt}/></a>
				{this.buildModal()}
			</div>
		);
	}

	buildModal(){
		return(
			<Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
				<ModalHeader toggle={this.toggle}>Tickets for Round {this.props.state.RoundNumber}</ModalHeader>
				<ModalBody>
					{this.winnerTickets()}
					<label>My Tickets</label><br/>
					{this.formatTickets()}
				</ModalBody>
				<ModalFooter>
					<Button color="secondary" onClick={this.toggle}>Close</Button>
				</ModalFooter>
			</Modal>
		);
	}

	formatTickets(){
		if(this.props.state.MyTickets){
			let str = "";
			for(let i = 0; i < this.props.state.MyTickets.length; i++){
				str += parseInt(this.props.state.MyTickets[i])+", ";
			}
			return (str).substring(0,(str).length-2);
		}
		return "";
	}

	winnerTickets(){
		if(this.props.state.WinnerTickets){
			return(
				<div>
					<label>Winning Tickets</label><br/>
					{this.props.state.WinnerTickets}
				</div>
			);
		}else{
			return (<div></div>);
		}
	}
}

export default TicketNumbers;
