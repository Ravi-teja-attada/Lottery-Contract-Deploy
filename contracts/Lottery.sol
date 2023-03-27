// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lottery {
    address public manager;

    //address[] public players;
    address payable[] public players;

    constructor() {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > .01 ether);

        //players.push(msg.sender);
        players.push(payable(msg.sender));
        
    }
    
    function random() private view returns (uint) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, players)))%251);
    }
    
    function pickWinner() public payable restricted {
        uint index = random() % players.length;
        players[index].transfer(address(this).balance);
        players = new address payable[](0);
    }
    function poolPrize() public view returns(uint) {
        return address(this).balance;
    }
    
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns (address payable[] memory) { //address[] -> address payable[] memory
        return players;
    }
}   