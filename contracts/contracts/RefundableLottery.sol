// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IChipsToken is IERC20 {
    function mint(address to, uint256 amount) external;
    function directTransferFrom(address from, address to, uint256 amount) external;
}

// RefundableLottery contract rules:
// 0.This contract is a lottery contract that allows the players to buy tickets with ether or ChipsToken.
// 1.Players can specify a lucky number between [0, 65535] as their ticket number when buying a ticket. 
// 2.The winner is chosen by blockhash and winner(s) get(s) all the prize pool in the current round. 
// 3.If there is no winner in the current round, then all players in THIS round can withdraw 99% of their ether(or chips).
// 4.The contract manager take the management fee (1% of the deposit balance, ether or chips).
// 5.When refunding ether, the player will get equivalent ChipsToken as the management fee they spend.
// 6.When players purchase tickets using ChipsToken, they will receive a 50% discount compared to paying with Ether.
// 7.The number of players using ChipsToken should be less than 50% of the total players in a round.
// NOTE: If there's a winner in a round, she/he will get all the prize pool so other players can't refund their tickets any more. 

contract RefundableLottery{
    // 1% management fee
    uint public constant management_fee_rate = 1;

    // ether for each ticket
    uint public constant ticket_price_in_ether = 0.01 ether;

    // Ticket number range [0, 65535]
    uint public constant ticket_number_range = 65535;

    // 1000 chips == 1 eth
    uint public constant chips_price_per_ether = 1000;

    // 50% discount for players using ChipsToken
    uint public constant discount_rate_using_chips = 50;

    // The price of ChipsToken is 1 ether == 1000 chips, so the original price of a ticket in ChipsToken is 10 chips.
    // But we offer a 50% discount for players using ChipsToken, so the price of a ticket in ChipsToken is 5 chips.
    uint public constant ticket_price_in_chips = ticket_price_in_ether * chips_price_per_ether * (100 - discount_rate_using_chips)/100;
    
    // In a round, the number of players using ChipsToken should be less than 50% of the total players. 
    uint public constant max_participate_rate_using_chips = 50;

    // The period of each round by blocks, about 1.5 hours.
    uint public constant round_period = 1000;

    // The manager of the contract takes the 1% management fee
    address payable public immutable manager;
    
    //The current round number
    uint public round_number;

    //The mapping of the ticket numbers of each player in each round
    //A player can buy more than one ticket in a round.
    //If there is no winner in this round, the player can refund all(99%) the tickets he/she holds in this round.
    //After the refund operation, the player's tickets in THIS round will be deleted.
    mapping(uint => mapping(address => uint[]) ) public tickets_purchased_with_ether;

    mapping(uint => mapping(address => uint[]) ) public tickets_purchased_with_chips;

    //The holders of a ticket.
    //A ticket can be held by more than one player.
    //If the ticket number is chosen as the winner, all the holders of this ticket will share the prize.
    mapping(uint => address[]) public ticket_holders;

    //The balance of each round.
    //If there is no winner in this round, all players can refund 99% of their ether in this round,
    //and the round balance will be reduced every time a player makes a refund.
    //If there is a winner in this round, the winner(s) get(s) all the ether in this round, 
    //and round_balance will be set to ZERO after draw.
    mapping(uint => uint) public round_ether_balance;

    mapping(uint => uint) public round_chips_balance;

    //The mapping of refundable state of each round.
    //If the current round is running, it's not refundable.
    //If the current round is end but havn't been draw, it's not refundable.
    //If the current round is end and there is no winner, it's refundable.
    mapping(uint => uint) public refundable;

    //draw state of each round
    mapping(uint => uint) public drawn;

    mapping(uint => uint) public players_count_using_ether;
    mapping(uint => uint) public players_count_using_chips;

    // ALERT: this block MUST be removed before launche
    uint public jackpot_num_for_test;

    IChipsToken public chips_token;

    event RoundStarted(uint indexed round, uint block_number);
    event BuyTicketEther(address indexed player, uint indexed round, uint ticket_num);
    event BuyTicketChips(address indexed player, uint indexed round, uint ticket_num);
    event DrawLottoryEther(uint indexed round, uint numbers,bytes32 block_hash, address winner, uint amount);
    event DrawLottoryChips(uint indexed round, uint numbers,bytes32 block_hash, address winner, uint amount);
    event RefundEther( uint indexed round, address indexed player, uint refund_balance);
    event RefundChips( uint indexed round, address indexed player, uint refund_balance);
    event RoundEnded(uint indexed round, bool refundable, uint jackpot_num, bytes32 block_hash, uint block_height, uint winner_count);
    constructor(address _token_address) {
        chips_token = IChipsToken(_token_address);
        manager = payable(msg.sender);
    }

    //Pickup a lucky number between [0, 65535] as your ticket number, 0 and 65535 are both acceptable.
    function buyTicketWithEther(uint _ticket_lucky_num) public payable {
        if(round_number == 0){
            round_number = block.number / round_period;
            emit RoundStarted(round_number, block.number);
        }
        require(msg.value == ticket_price_in_ether, "The price for a ticket is 0.01 ether");
        require(round_number == (block.number / round_period), "The last round is not draw yet,please try again later");
        require(_ticket_lucky_num >= 0 && _ticket_lucky_num <= ticket_number_range, "The ticket number should be between [0,65535]");
        require(msg.sender == tx.origin, "Only EOA(Externally Owned Account) can call this function");

        tickets_purchased_with_ether[round_number][msg.sender].push(_ticket_lucky_num);
        ticket_holders[_ticket_lucky_num].push(msg.sender);
        round_ether_balance[round_number] += msg.value;
        
        players_count_using_ether[round_number] += 1;
        emit BuyTicketEther(msg.sender, round_number, _ticket_lucky_num);
    }

    function buyTicketWithChips(uint _ticket_lucky_num) public {
        if(round_number == 0){
            round_number = block.number / round_period;
            emit RoundStarted(round_number, block.number);
        }
        require(round_number == (block.number / round_period), "The last round is not draw yet");
        require(_ticket_lucky_num >= 0 && _ticket_lucky_num <= ticket_number_range, "The ticket number should be between [0,65535]");
        require(msg.sender == tx.origin, "Only EOA(Externally Owned Account) can call this function");

        players_count_using_chips[round_number] += 1;
        uint a = players_count_using_chips[round_number];
        uint b = players_count_using_ether[round_number];
        require(b > 0, "There is no player using Ether in this round, so you can not use ChipsToken");
        require((a*100)/(a+b) <= max_participate_rate_using_chips, "The number of players using ChipsToken should be less than 50% of the total players");
        
        tickets_purchased_with_chips[round_number][msg.sender].push(_ticket_lucky_num);
        ticket_holders[_ticket_lucky_num].push(msg.sender);

        //The directTransferFrom will revert if the player does not have enough ChipsToken.
        chips_token.directTransferFrom(msg.sender, address(this), ticket_price_in_chips);
        round_chips_balance[round_number] += ticket_price_in_chips;

        emit BuyTicketChips(msg.sender, round_number, _ticket_lucky_num);
    }

    // ALERT: this block MUST be removed before launche
    function setJackpotNumForTest(uint num) public{
        jackpot_num_for_test = num;
    }
    //Any player can call this function to trigger the draw operation.
    //For example, if your ticket number is 65535, that is 0xFFFF in hexadecimal, 
    //and the hash of the last block is ending with FFFF, then you are the winner.
    //The owner of the contract take the management fee (1% of this round balance) no matter what.
    function drawLottery() public {
        require(drawn[round_number] == 0, "The current round is already drawn");
        require(round_number < (block.number / round_period), "The current round is not end yet");

        //The draw operation can only be called one time for each round.
        drawn[round_number] = 1;

        //If there is no player in this round, nothing to do and start the next round.
        if(round_ether_balance[round_number] == 0){
            round_number = block.number / round_period;
            emit RoundStarted(round_number, block.number);
            return;
        }

        //The winner is chosen by the hash of last block.
        bytes32 block_hash = blockhash(block.number - 1);
        uint jackpot_num = uint(block_hash) % 65536;
        
        // ALERT: this block MUST be removed before launche
        if(jackpot_num_for_test > 0)
            jackpot_num = jackpot_num_for_test;

        //The manager of the contract take the management fee (1% of the deposit balance).
        uint management_fee_ether = round_ether_balance[round_number] * management_fee_rate / 100;
        round_ether_balance[round_number] -= management_fee_ether;
        manager.transfer(management_fee_ether);

        uint management_fee_chips = round_chips_balance[round_number] * management_fee_rate / 100;
        round_chips_balance[round_number] -= management_fee_chips;
        chips_token.transfer(manager, management_fee_chips);

        //The winners could be more than ONE person and they will share the ether in the current round.
        if(ticket_holders[jackpot_num].length > 0){
            uint winner_ether_balance = round_ether_balance[round_number] / ticket_holders[jackpot_num].length;
            uint winner_chips_balance = round_chips_balance[round_number] / ticket_holders[jackpot_num].length;
            for(uint i = 0; i < ticket_holders[jackpot_num].length; i++){
                payable(ticket_holders[jackpot_num][i]).transfer(winner_ether_balance);
                emit DrawLottoryEther(round_number, jackpot_num, block_hash, ticket_holders[jackpot_num][i], winner_ether_balance);
                
                if(winner_chips_balance > 0){
                    require(chips_token.transfer(ticket_holders[jackpot_num][i], winner_chips_balance), "The transfer of ChipsToken failed");
                    emit DrawLottoryChips(round_number, jackpot_num, block_hash, ticket_holders[jackpot_num][i], winner_chips_balance);
                }
            }
            round_ether_balance[round_number] = 0;
            round_chips_balance[round_number] = 0;
            refundable[round_number] = 0;
            emit RoundEnded(round_number, false, jackpot_num, block_hash, block.number - 1, ticket_holders[jackpot_num].length);
        }else{
            //If there is no winner in current round, all players in THIS round can refund 99% of their ether(or ChipsToken).
            refundable[round_number] = 1;
            emit RoundEnded(round_number, true, jackpot_num, block_hash, block.number - 1, 0);
        }
                        
        //The next round will not start until the current round is draw.
        round_number = block.number / round_period;
        emit RoundStarted(round_number, block.number);
    }

    function refundEther(uint previous_round_number) public  {
        require(previous_round_number < (block.number / round_period), "You can not refund the current round");
        require(drawn[previous_round_number] == 1, "The current round is not drawn yet, you can call drawLottery first");
        require(refundable[previous_round_number] == 1, "The prize pool of this round has been taken by the winner(s)");
        
        //A player can refund all the tickets he/she holds in the previous round as long as there is no winner in that round.
        uint tickets_count = tickets_purchased_with_ether[previous_round_number][msg.sender].length;
        require(tickets_count > 0, "You did not hold any ticket purchased by ether in this round");
        delete tickets_purchased_with_ether[previous_round_number][msg.sender];

        uint refund_balance = tickets_count * ticket_price_in_ether * (100 - management_fee_rate) / 100;
        require(round_ether_balance[previous_round_number] >= refund_balance, "The balance of this round is not enough for refund");
        require(address(this).balance >= refund_balance, "The contract balance is not enough for refund");
        round_ether_balance[previous_round_number] -= refund_balance;
        payable(msg.sender).transfer(refund_balance);
        
        emit RefundEther(previous_round_number, msg.sender, refund_balance);

        //As player paid 1% management fee when playing the game, the player will get equivalent ChipsToken when refunding.
        //For example, if a player paid 0.01 ether for a ticket, the management fee is 0.01 * 1% = 0.0001 ether.
        //As the price of ticket in one ether is 1000 chips, the player will get 0.0001 * 1000 = 0.1 chips when refunding.
        chips_token.mint(msg.sender, tickets_count * ticket_price_in_ether * management_fee_rate * chips_price_per_ether/100 );
    }

    function refundChips(uint previous_round_number) public {
        require(previous_round_number < (block.number / round_period), "You can not refund the current round");
        require(drawn[previous_round_number] == 1, "The current round is not drawn yet, you can call drawLottery first");
        require(refundable[previous_round_number] == 1, "The prize pool of this round has been taken by the winner(s)");
        
        //A player can refund all the tickets he/she holds in the previous round as long as there is no winner in that round.
        uint tickets_count = tickets_purchased_with_chips[previous_round_number][msg.sender].length;
        require(tickets_count > 0, "You did not hold any ticket purchased by Chips  in this round");
        delete tickets_purchased_with_chips[previous_round_number][msg.sender];

        uint refund_balance = tickets_count * ticket_price_in_chips * (100 - management_fee_rate) / 100;
        require(round_chips_balance[previous_round_number] >= refund_balance, "The balance of this round is not enough for refund");
        require(chips_token.balanceOf(address(this)) >= refund_balance, "The contract balance is not enough for refund");
        round_chips_balance[previous_round_number] -= refund_balance;
        require(chips_token.transfer(msg.sender, refund_balance), "The transfer of ChipsToken failed");
        
        emit RefundChips(previous_round_number, msg.sender, refund_balance);
        //The player will NOT get extra ChipsToken when refunding chips token.
    }
}
