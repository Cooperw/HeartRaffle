pragma solidity ^0.4.24; 

//This contract reference from https://github.com/k26dr/ethereum-games/blob/master/contracts/Lotteries.sol
// and car auction homework
contract Raffle {
    uint constant public TICKET_PRICE = 1e18;

    address[] public tickets;
    address[3] public winners;
    bytes32[3] public seeds;
    uint i;
    mapping(address => bytes32) public commitments;
   

    uint public ticketDeadline;
    uint public revealDeadline;
    
    uint public winners_prize;
    uint public first_winner_prize;
    uint public second_winner_prize;
    uint public third_winner_prize;
    
    uint public charity_prize;
    uint public developer_prize;
    
    address owner;
    
    
    enum raffleState {
       STARTED, TICKET_CLOSED, REVEAL_CLOSED 
    }
    raffleState public STATE;
    
     modifier only_owner(){
        require(msg.sender== owner);
        _;
    }

    function Raffle (address _owner, uint _duration, uint _revealDuration) public {
        ticketDeadline = now + _duration * 1 hours;
        revealDeadline = ticketDeadline + _revealDuration * 1 hours;
        STATE = raffleState.STARTED;
        i=1;
        owner = _owner;
    }
    
    function createCommitment(address user, uint N) 
      public pure returns (bytes32 commitment) {
        return keccak256(user, N);
    }

    function buy (uint N) payable public {
        require(msg.value == TICKET_PRICE,"The input value is not eaqual to ticket price!"); 
        require(now < ticketDeadline, "It ticket selling is closed!");

        commitments[msg.sender] = createCommitment(msg.sender, N);
        tickets.push(msg.sender);
    }
    
       function reveal (uint N) public {
        require(now >= ticketDeadline);
        require(now < revealDeadline);

        bytes32 hash = createCommitment(msg.sender, N);
        require(hash == commitments[msg.sender]);
    
        seeds[i%3] = keccak256(seeds[(i-1)%3], N);
        i++;
        
    }

    function drawWinner () public {
        require(now > revealDeadline,"You cannot draw winner since it is before reveal deadline! ");
        require(winners[0] == address(0) && winners[1] == address(0) && winners[2] == address(0), " The winner has been drawn!");

        uint randIndex = uint(seeds[0]) % tickets.length;
        winners[0] = tickets[randIndex];
        if(randIndex != (tickets.length-1)){
            tickets[randIndex]=tickets[tickets.length-1];
        }
        
        
          randIndex = uint(seeds[1]) % (tickets.length -2);
         winners[1] = tickets[randIndex];
          if(randIndex != (tickets.length -2)){
            tickets[randIndex]=tickets[tickets.length-2];
        }
         
           randIndex = uint(seeds[2]) % (tickets.length -3);
         winners[2] = tickets[randIndex];
         
         distribution();
    }
    
    function distribution () internal  {
       winners_prize = this.balance *9 /10;
       first_winner_prize = winners_prize * 5 /10;
       second_winner_prize = winners_prize * 34 /100 ;
       third_winner_prize = winners_prize * 16 /100;
       
       developer_prize = this.balance / 100;
       
       charity_prize = this.balance - winners_prize - developer_prize; 
        
    }

    function withdraw_first_winner () public {
        require(msg.sender == winners[0]," You are not first place winner!");
        uint prize = first_winner_prize;
        first_winner_prize = 0;
        msg.sender.transfer(prize);
    }
    function withdraw_second_winner () public {
        require(msg.sender == winners[1], "You are not the seconde place winner!");
        uint prize = second_winner_prize;
        second_winner_prize = 0;
        msg.sender.transfer(prize);
    }
    function withdraw_third_winner () public {
        require(msg.sender == winners[2],"You are not the third place winner!");
        uint prize = third_winner_prize;
        third_winner_prize = 0;
        msg.sender.transfer(prize);
    }
    
   function ticket_close() external only_owner returns(bool) {
       require (now < ticketDeadline,"You cannot close it since ticket selling has already closed!");
        ticketDeadline = now;
        STATE = raffleState.TICKET_CLOSED;
        return true;
    }
    
    function reveal_close() external only_owner returns(bool) {
       
        require(now >= ticketDeadline,"You cannot close reveal because it ticket selling has not closed!");
        revealDeadline = now;
        STATE = raffleState.REVEAL_CLOSED;
        return true;
    }
    
    function destruct_traffle() external only_owner returns(bool){
        require(now > revealDeadline,"You cannot destruct the contract since it is before reveal deadline! ");
        require( first_winner_prize==0, " the first place winner has not withdrawn money!");
        require ( second_winner_prize == 0, " The second place winner has not withdrawn money!");
        require( third_winner_prize == 0, " The third place winner has not withdrawn money!");
        require ( charity_prize==0,"the charity_prize has not been withdrawn!");
        require( developer_prize == 0, "the developer has not withdrwan their money!");
        selfdestruct(owner);
    }
    
   
}
