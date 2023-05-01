// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//using custom errors
//makes the contract more gas efficient because we don't have to store error strings in memory

error NotOwner();


contract FundMe{

    using PriceConverter for uint256;
    //meaning any uint256 variable can now call functions from this library
    //as if it were an object

    //$50 at least
    //uint256 public minimumUSD = 50 * 1e18; beacuse the value returned by other functions will have 18 zeros
    address[] public funders;
    mapping(address => uint256) public addressToAmoutDonated;

    //making the variables immutable and constant saves gas because they require less memory
    //and there values can be read at compile time and stored directly in the byte code
    //constant because we're also initializing it here
    //immutable because we're at least setting its value once (inside the constructor)

    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 1e18;

    AggregatorV3Interface public priceFeedObject;

    //constructors run when the contract is deployed, so when this runs the msg.sender will be the contrac owner
    constructor(address priceFeedAddress){
        i_owner = msg.sender;
        priceFeedObject = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable{
        //getConversionRate(msg.value) becomes msg.value.getConversionRate();
        //and the msg.value becomes the first argument passed to the getConversionRate()
        require(msg.value.getConversionRate(priceFeedObject) > MINIMUM_USD, "Must send greater than 50 dollars!");
        funders.push(msg.sender);
        addressToAmoutDonated[msg.sender] = msg.value;
    }

    //the onlyOwner modifier will run the modifier block and check if the sender is owner (user defined modifier)
    function widthdraw() public onlyOwner{

        for(uint256 i = 0; i < funders.length; i++){
            //getting the address one by one
            address funder = funders[i];

            //setting the amount on this address key to 0
            addressToAmoutDonated[funder] = 0;
        }

        //now we need to reset the funders array as well

        //we are just gonna make it point to a new address array with 0 elements in it to begin with
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed!");

        //three ways to send native blockchain currency

        //transfer function
        // msg.sender.transfer(this.balance)
        //typecasting *msg.sender* address to a *payable* address (where we can send money to)
        //typecasting *this* (current address reference) to, well, an address
        //automatically reverts
        // payable(msg.sender).transfer(address(this).balance)

        //send function
        //returns a bool, so we need to explicitly check for success and revert
        // bool isSent = payable(msg.sender).send(address(this).balance);
        // require(isSent, "Couldn't send money!");

        //call function --> recommended way -- a lower level call
        //this allows us to call any function on the entirety of ethereum blockchain
        //we're not really calling any function here so we're gonna leave that argument as an empty string
        //although what we can do is send some money with it
        //so we're sending the current balance and passing in the *value* that we usually pass when calling the fund function

        //the bytes variable stores whatever is returned by the function call we specify
        //using the memory keyword because bytes is gonna be an array (which is not a primitive data type)

        //(bool callSuccess, bytes memory dataReturned) = payable(msg.sender).call{value: address(this).balance}("");
    }

    modifier onlyOwner{
        //require(msg.sender == i_owner, "Unauthorized access! Sender is not owner"); //--> do this first
        
        //same as the above require, new and recommended (more gas efficient)
        if(msg.sender != i_owner){
            revert NotOwner();
        }
        _; //--> execute the rest of the function later
    }

    //           is msg.data empty?
    //                /      \
    //              yes       no
    //              /          \
    //         recieve hai?    fallback()
    //          /      \
    //         yes     no
    //        /          \
    //    receive()    fallback()

    //what happens when someone sends this contract money without calling the fund function???
    //just like how I was trying to send ETH through MetaMask, I can't really call the fund function there, right?

    //so when that's the case, the *receive* function will run
    //receive function runs when there is no data with the transaction
    // ie, when it's not specified which function to call
    receive() external payable{
        fund();
    }

    //fallback is another function that runs when the function is specified but it doesn't exit
    //that's why it's a fallback ¯\_(ツ)_/¯ 
    fallback() external{
        fund();
    }
}