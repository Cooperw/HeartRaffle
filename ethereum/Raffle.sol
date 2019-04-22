pragma solidity ^0.5.0; 

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

// 90% of this contract is from https://github.com/k26dr/ethereum-games/blob/master/contracts/Lotteries.sol
// OraclizeAPI from https://github.com/Dziubutkus/lottery-smart-contract/blob/master/contracts/Lottery.sol
contract Raffle is usingOraclize {
    struct Round {
        uint endBlock;
        uint drawBlock;
        Entry[] entries;
        uint totalQuantity;
        uint totalPrizes;
        address[] winners;
        uint[] winningTickets;
    }
    struct Entry {
        address buyer;
        uint quantity;
    }

    uint constant public TICKET_PRICE = 1e15; //0.01
    uint constant public WINNERS_POT = 89;
    uint constant public CHARITY_POT = 10;
    uint constant public DEVELOPER_POT = 1;
    address public DEV_ADDRESS;

    mapping(uint => Round) public rounds;
    uint public round;
    uint public duration;
    mapping (address => uint) public balances;
    
    // stores oraclize query ids, is used to confirm that the received response from oraclize
    // is not malicious
    mapping(bytes32=>bool) validIds;
    mapping(bytes32=>uint) queryIdToRoundNumber;
    mapping(bytes32=>uint) queryIdToWinnerNumber;
    
    event TicketPurchased(address buyer, uint quantity);
    event NewOraclizeQuery(string description);
    event RandomNumber(string description, uint rand);
    event WinnerPicked(uint place, address winner, uint prize); 

    // duration is in blocks. 1 day = ~5500 blocks
    constructor (uint _duration) public {
        duration = _duration;
        round = 1;
        rounds[round].endBlock = block.number + duration;
        rounds[round].drawBlock = block.number + duration + 1;
        rounds[round].winners = [address(0),address(0),address(0)];
        rounds[round].winningTickets = [0,0,0];
        DEV_ADDRESS = msg.sender;
        oraclize_setCustomGasPrice(4000000000);
    }

    function buy () payable public {
        require(msg.value % TICKET_PRICE == 0);

        if (block.number > rounds[round].endBlock) {
            round += 1;
            rounds[round].endBlock = block.number + duration;
            rounds[round].drawBlock = block.number + duration + 5;
        }

        uint quantity = msg.value / TICKET_PRICE;
        Entry memory entry = Entry(msg.sender, quantity);
        rounds[round].entries.push(entry);
        rounds[round].totalQuantity += quantity;
        emit TicketPurchased(msg.sender, quantity);
    }

    function drawWinners (uint _round) public {
        Round storage drawing = rounds[_round];
        require(block.number > drawing.drawBlock, "The raffle is still active.");
        require(drawing.entries.length > 0, "No one entered the raffle.");
        require(drawing.winners[0] == address(0), "Winners already picked.");
        
        // pay devs
        balances[DEV_ADDRESS] += TICKET_PRICE * drawing.totalQuantity * DEVELOPER_POT / 100;
        
        // pick 3 winners
        _consultTheOracle(0, _round);
        _consultTheOracle(1, _round);
        _consultTheOracle(2, _round);
    }
    
    function _consultTheOracle(uint _number, uint _round) internal {
        bytes32 queryId = oraclize_query("WolframAlpha", strConcat("random integer between 0 and ", uint2str(rounds[_round].totalQuantity-1)));
        validIds[queryId] = true;
        queryIdToRoundNumber[queryId] = _round;
        queryIdToWinnerNumber[queryId] = _number;
        emit NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
    }

    function __callback(bytes32 myid, string memory result) public {
        require(msg.sender == oraclize_cbAddress(), "msg.sender is not Oraclize");
        require(validIds[myid]);
        
        uint winningTicket = parseInt(result);
        rounds[queryIdToRoundNumber[myid]].winningTickets[queryIdToWinnerNumber[myid]] = winningTicket;
        emit RandomNumber("Winning ticket:", winningTicket);
    }
    
    function processWinners(uint _round, uint _number) public {
        Round storage drawing = rounds[_round];
        require(block.number > drawing.drawBlock, "The raffle is still active.");
        require(drawing.entries.length > 0, "No one entered the raffle.");
        require(drawing.winners[_number] == address(0), "Winners already picked.");
        require(drawing.winningTickets[_number] != 0, "Oracle did not complete the query yet for that winner.");

        calcWinner(_number, drawing);
    }
    
    function calcWinner(uint _number, Round storage drawing) private{
        uint counter = drawing.winningTickets[_number];
        for (uint i=0; i < drawing.entries.length; i++) {
            uint quantity = drawing.entries[i].quantity;
            if (quantity > counter) {
                drawing.winners[_number] = drawing.entries[i].buyer;
                break;
            }
            counter -= quantity;
        }
        
        //Allocate portion of pot to winner
        uint prize = TICKET_PRICE * drawing.totalQuantity * WINNERS_POT * (3-_number) / 600; //6*100 parts*percent
        balances[drawing.winners[_number]] += prize;
        drawing.totalPrizes += prize;
        emit WinnerPicked(_number, drawing.winners[_number], prize);
    }

    function withdraw () public {
        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    function deleteRound (uint _round) public {
        require(block.number > rounds[_round].drawBlock + 100);
        require(rounds[_round].winners[0] != address(0));
        delete rounds[_round];
    }

    function () external payable {
        buy();
    }
    
    //Getters for Front-End
    function GetRound() public view returns (uint){
        return round;
    }
    function GetRoundBalance(uint _round) public view returns (uint){
        return TICKET_PRICE * rounds[round].totalQuantity;
    }
    function GetRoundPlayerBalance(uint _round) public view returns (uint){
        return TICKET_PRICE * rounds[round].totalQuantity * WINNERS_POT / 100;
    }
    function GetRoundCharityBalance(uint _round) public view returns (uint){
        return TICKET_PRICE * rounds[round].totalQuantity * CHARITY_POT / 100;
    }
    function GetRoundDeveloperBalance(uint _round) public view returns (uint){
        return GetRoundBalance(_round) - GetRoundPlayerBalance(_round) - GetRoundCharityBalance(_round);
    }
    function GetRoundWinners(uint _round) public view returns (address[] memory){
        return rounds[_round].winners;
    }
    function GetRoundWinnerBalance(uint _round, uint _number) public view returns (uint){
        return TICKET_PRICE * rounds[_round].totalQuantity * WINNERS_POT * (3-_number) / 600;
    }
    function GetEndTime(uint _round) public view returns (uint){
        uint calcSeconds = (rounds[_round].endBlock - block.number) * 15;
        uint maxSeconds = 320000000; //decade
        if(calcSeconds > maxSeconds)
            return 0;
        return calcSeconds;
    }
    function GetDrawTime(uint _round) public view returns (uint){
        uint calcSeconds = (rounds[_round].drawBlock - block.number) * 15;
        uint maxSeconds = 320000000; //decade
        if(calcSeconds > maxSeconds)
            return 0;
        return calcSeconds;
    }
    function GetMyBalance() public view returns (uint){
        return balances[msg.sender];
    }
    function GetMyEntries(uint _round) public view returns (uint){
        uint count = 0;
        for(uint i = 0; i < rounds[_round].entries.length; i++){
            if(msg.sender == rounds[_round].entries[i].buyer){
                count += rounds[_round].entries[i].quantity;
            }
        }
        return count;
    }
}

