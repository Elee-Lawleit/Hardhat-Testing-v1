//writing the deploy scripts using hardhat-deploy package
//which helps in making deploying contracts easier
//also keeps tracks of all the deployed contracts and such

const {networkConfig, developmentChains} = require("../helper-hardhat-config");
const {network} = require("hardhat")
const{verify} = require("../utils/verify")

module.exports = async({getNamedAccounts, deployments})=>{

    const {deploy, log} = deployments;

    //grabbing the "deployer" account mentioned in hh config
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    //bc interfaces such as Price Feeds are only availaible on main nets/test nets, it's not possible for us to test the contracts locally before deploying them on the blockchain

    //to overcome this problem, we can use "Mocks"
    // Mock --> simulatiing the behaviour of an object

    // but before that, what if you want to change the blockchain you're on? The hardcoded address belongs to only one chain -- just make it dynamic

    
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"];

    let ethUsdPriceFeedAddress
    // if we are at a local/dev network, get the address of the most recent deployed contract ie, the mock
    if(developmentChains.includes(network.name)){
        //get the contract itseld
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")

        //get its address
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    }
    else{
        //if not on dev network, then simply grab the address from network config file
        ethUsdPriceFeedAddress =
            networkConfig[chainId]["ethUsdPriceFeedAddress"]
    }

    /***** VERIFIYING *****/
    // don't need to verify on dev chains

    //if the contract isn't available locally, we deploy a minimal version of it locally, before deploying the main contract

    const args = [ethUsdPriceFeedAddress];

    const fundMe = await deploy("FundMe", {
        from: deployer,
        //constructor args
        args: args, //put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log("------------------------------------------------------")

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
}

//can run only this one, when using yarn hardhat deploy --tags fundme
module.exports.tags = ["all", "fundme"];