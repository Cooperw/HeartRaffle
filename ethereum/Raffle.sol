pragma solidity ^0.5.0; 

import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";

// 80% of this contract is from https://github.com/k26dr/ethereum-games/blob/master/contracts/Lotteries.sol
// OraclizeAPI from https://github.com/Dziubutkus/lottery-smart-contract/blob/master/contracts/Lottery.sol

contract Raffle is usingOraclize {
    struct Round {
        uint endBlock;
        address[] entries;
        uint totalQuantity;
        uint totalPrizes;
        address[] winners;
        string winningTickets;
        bool oraclized;
        mapping (address => uint) votingBalances;
        mapping (address => uint) charityBalances;
        uint votingQuantity;
        address[] charities;
    }
    
    struct Charity {
        string name;
        string url;
        address owner;
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
    mapping (address => Charity) public charities;

    // stores oraclize query ids, is used to confirm that the received response from oraclize
    // is not malicious
    mapping(bytes32=>bool) validIds;
    mapping(bytes32=>uint) queryIdToRound;

    event CastVotes(address charity, uint quantity);
    event TicketPurchased(address buyer, uint quantity);
    event NewOraclizeQuery(string description);
    event RandomNumber(string description, string rands);
    event WinnerPicked(uint place, address winner, uint prize); 

    // duration is in blocks. 1 day = ~5500 blocks
    constructor (uint _duration) public {
        duration = _duration;
        round = 1;
        rounds[round].endBlock = block.number + duration;
        rounds[round].winners = [address(0),address(0),address(0)];
        DEV_ADDRESS = msg.sender;
    }

    function buy () payable public {
        require(msg.value % TICKET_PRICE == 0);

        if (block.number > rounds[round].endBlock) {
            round += 1;
            rounds[round].endBlock = block.number + duration;
        }

        uint quantity = msg.value / TICKET_PRICE;
        for(uint i = 0; i < quantity; i++){
            address entry = msg.sender;
            rounds[round].entries.push(entry);
            rounds[round].totalQuantity += 1;
            rounds[round].votingBalances[msg.sender] += 1;
        }
        emit TicketPurchased(msg.sender, quantity);
    }

    function vote (address _charity, uint _tokens, uint _round) public {
        require(block.number < rounds[_round].endBlock, "The raffle is already over.");
        require(_tokens < rounds[_round].votingBalances[msg.sender], "Insufficient voting tokens.");
        require(_tokens > 0, "Please specify number of voting tokens.");
        
        rounds[_round].votingBalances[msg.sender] -= _tokens;
        if(rounds[_round].charityBalances[_charity] <= 0){
            rounds[_round].charities.push(_charity);
        }
        rounds[_round].charityBalances[_charity] += _tokens;
        rounds[_round].votingQuantity += _tokens;
        
        emit CastVotes(_charity,_tokens);
    }
    
    function register (string memory _name, string memory _url) public{
        Charity memory charity;
        charity.name = _name;
        charity.url = _url;
        charity.owner = msg.sender;
        charities[msg.sender] = charity;
    }

    function drawWinners (uint _round) public {
        require(block.number > rounds[_round].endBlock, "The raffle is still active.");
        require(rounds[_round].entries.length > 0, "No one entered the raffle.");
        require(rounds[_round].winners[0] == address(0), "Winners already picked.");
        require(!rounds[_round].oraclized, "The Oracle was already consulted.");
        
        rounds[_round].oraclized = true;
        
        // pay devs
        balances[DEV_ADDRESS] += TICKET_PRICE * rounds[_round].totalQuantity * DEVELOPER_POT / 100;
        
        // pick 3 winners
        _consultTheOracle(_round);
    }
    
    function _consultTheOracle(uint _round) internal {
        bytes32 queryId = oraclize_query("WolframAlpha", strConcat("three random integers between 0 and ", uint2str(rounds[_round].totalQuantity-1)));
        
        validIds[queryId] = true;
        queryIdToRound[queryId] = _round;
        
        emit NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
    }

    function __callback(bytes32 myid, string memory result) public {
        require(msg.sender == oraclize_cbAddress(), "msg.sender is not Oraclize");
        require(validIds[myid]);
        
        splitAndSet(result, queryIdToRound[myid]);
        for(uint i = 0; i < 3; i++){
            //Allocate portion of pot to winner
            uint prize = TICKET_PRICE * rounds[queryIdToRound[myid]].totalQuantity * WINNERS_POT * (3-i) / 600; //6*100 parts*percent
            balances[rounds[queryIdToRound[myid]].winners[i]] += prize;
            rounds[queryIdToRound[myid]].totalPrizes += prize;
            emit WinnerPicked(i, rounds[queryIdToRound[myid]].winners[i], prize);
        }
        rounds[queryIdToRound[myid]].winningTickets = result;
        emit RandomNumber("Winning tickets:", result);
    }

    function withdraw () public {
        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    function () external payable {
        buy();
    }
    
    //Getters for Front-End
    function GetRound() public view returns (uint){
        return round;
    }
    function GetRoundBalance(uint _round) public view returns (uint){
        return TICKET_PRICE * rounds[_round].totalQuantity;
    }
    function GetRoundPlayerBalance(uint _round) public view returns (uint){
        return TICKET_PRICE * rounds[_round].totalQuantity * WINNERS_POT / 100;
    }
    function GetRoundCharityBalance(uint _round) public view returns (uint){
        return TICKET_PRICE * rounds[_round].totalQuantity * CHARITY_POT / 100;
    }
    function GetRoundDeveloperBalance(uint _round) public view returns (uint){
        return GetRoundBalance(_round) - GetRoundPlayerBalance(_round) - GetRoundCharityBalance(_round);
    }
    function GetRoundWinnerTickets(uint _round) public view returns (string memory){
        return rounds[_round].winningTickets;
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
    function GetMyBalance() public view returns (uint){
        return balances[msg.sender];
    }
    function GetMyTicketNumbers(uint _round) public view returns (uint[] memory){
        uint[] memory tickets = new uint[](GetMyEntries(_round));
        uint count = 0;
        for(uint i = 0; i < rounds[_round].entries.length; i++){
            if(msg.sender == rounds[_round].entries[i]){
                tickets[count] = i;
                count += 1;
            }
        }
        return tickets;
    }
    function GetMyEntries(uint _round) public view returns (uint){
        uint count = 0;
        for(uint i = 0; i < rounds[_round].entries.length; i++){
            if(msg.sender == rounds[_round].entries[i]){
                count += 1;
            }
        }
        return count;
    }
    function GetMyVotingBalance(uint _round) public view returns (uint){
        return rounds[_round].votingBalances[msg.sender];
    }
    function GetVotingQuantity(uint _round) public view returns (uint){
        return rounds[_round].votingQuantity;
    }
    function GetRoundCharities(uint _round) public view returns (address[] memory){
        return rounds[_round].charities;
    }
    function GetCharityRoundBalance(uint _round, address _charity) public view returns (uint){
        return rounds[_round].charityBalances[_charity];
    }
    function GetCharityName(address _charity) public view returns (string memory){
        return charities[_charity].name;
    }
    function GetCharityUrl(address _charity) public view returns (string memory){
        return charities[_charity].url;
    }
    
    //String library - https://github.com/willitscale/solidity-util/blob/master/lib/Strings.sol
    //Modified for HeartRaffle to reduce gas and complexity
    function splitAndSet(string memory _base, uint _round)
        internal
        returns (uint[] memory splitArr) {
        bytes memory _baseBytes = bytes(_base);
        uint _offset = 0;
        uint winner_number = 0;
        string memory _value = ","; //Wolfram uses comma delimited

        while(_offset < _baseBytes.length-1) {

            int _limit = _indexOf(_base, _value, _offset);
            if (_limit == -1) {
                _limit = int(_baseBytes.length);
            }

            string memory _tmp = new string(uint(_limit)-_offset);
            bytes memory _tmpBytes = bytes(_tmp);

            uint j = 0;
            for(uint i = _offset; i < uint(_limit); i++) {
                _tmpBytes[j++] = _baseBytes[i];
            }
            _offset = uint(_limit) + 1;
            
            //Set up winners on the fly with already paid for storage
            rounds[_round].winners[winner_number] = rounds[_round].entries[parseInt(string(_tmpBytes))];
            winner_number += 1;
        }
        return splitArr;
    }
    
    //String library - https://github.com/willitscale/solidity-util/blob/master/lib/Strings.sol
    function _indexOf(string memory _base, string memory _value, uint _offset)
        internal
        pure
        returns (int) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);

        assert(_valueBytes.length == 1);

        for(uint i = _offset; i < _baseBytes.length; i++) {
            if (_baseBytes[i] == _valueBytes[0]) {
                return int(i);
            }
        }

        return -1;
    }
}
