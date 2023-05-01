require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: __dirname + "/.env" });
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ETHEREUM_ACCOUNT_PRIVATE_KEY = process.env.ETHEREUM_ACCOUNT_PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
    defaultNetwork: "hardhat",
    //yarn hardhat run .\scripts\deploy.js --network hardhat --> to be explicit at runtime (running with a specific network)

    //it deploys on the fake hardhat network by default

    //can also use our custom networks
    //or test networks, other than the provided fake one
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [
                ETHEREUM_ACCOUNT_PRIVATE_KEY /* ACC_PR_Key_02,  ACC_PR_Key_03*/,
            ],
            chainId: 11155111,
            //to wait this many blocks
            blockConfirmations: 6
        },
        //this is different from the fake hardhat network, the fake network only lives until the execution of the script is complete
        //this still uses the hardhat network, but is sort of the same as ganache
        //this one gets reset AFTER it gets ctrled + c
        localhost: {
            url: "http://127.0.0.1:8545/",
            // accounts: [don't need to give any account here, hardhat automatically gets them]
            chainId: 31337,
        },
    },
    // solidity: "0.8.7",
    //adding multiple solidity version, to work with multiple contracts which are on different solidity versions
    solidity:{
      compilers:[
        {version: "0.8.8"},
        {version: "0.6.6"}
      ]
    },

    //etherscan plugin

    //plugins are added as tasks that can be run using "yarn hardhat [task_name]"
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    //to see how much gas each of our functions cost
    //is automatically run after we run tests
    gasReporter: {
        enabled: true,
        //to output to a text file
        outputFile: "gasReporterOutput.json",
        noColors: true,
        currency: "PKR",
        coinmarketcap: COINMARKETCAP_API_KEY,
        //to see info for different blockchains, MATIC is for polygon
        token: "ETH",
    },
    //to give the accounts being used a name
    //to easily access them
    namedAccounts: {
      deployer: {
        //"deployer" is the name, by default the 0th acc is the "deployer", accross all chains
        default: 0,

        //can set different deployer accounts based on different chains
        //add the chainId number and then the position of the account in the array

        // 11155111: 3

        // ^ the account at position 3 will be used as deployer for Sepolia now
      },
      //can create multiple named accounts
      // user:{
      //   default: 1
      // }
    },
}
