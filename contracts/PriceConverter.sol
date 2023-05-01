// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//the logic for this interface is defined in the smart contract whose address is pasted below
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
//the import statement referes to the npm package on npmjs website

library PriceConverter{

    //gonna use chainlink data feeds to get the price
    function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256){
        //we are gonna contact a contract that can comminucate to the chainlink data feed to get the price
        //for that, we need the address of the contract, and the ABI (interface which defines all the functions)

        (
            ,int256 price,,,
        ) = priceFeed.latestRoundData();
        //price of ETH in terms of USD
        //the price is gonna be in dollars ie 150000000000 -> actual is 1500.00000000
        //because this contract has 8 decimal places, can be checked by calling the demicals()

        //typecasting to uint256 because msg.value is a uint256 variable

        //the decimal places in the contract is 8, but our msg.value is gonna have 18 decimal places
        //because 1 eth = 1000000000000000000 wei

        //to match the decimal places we need to multiply the returned price with 8 decimal places with 1e10
        // ie 1.0000000000

        return uint256 (price * 1e10);
    }


    //the first argument is what the function is being called on
    //kinda like the implicit argument, but here its kinda explicit

    function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeedObject) internal view returns (uint256){
        uint256 ethPrice = getPrice(priceFeedObject);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}