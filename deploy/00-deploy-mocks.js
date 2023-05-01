const {network, getNamedAccounts} = require("hardhat");
const {developmentChains, DECIMALS, INITIAL_ANSWER} = require("../helper-hardhat-config");

module.exports = async({getNamedAccounts, deployments})=>{
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    //if the current running network is one of the development chains
    if(developmentChains.includes(network.name)){
        log("Working on Local Network... Deploying mocks now...");

        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            //we can provide our own contructor arguments
            args: [DECIMALS, INITIAL_ANSWER]
        })
        log("MOCKS DEPLOYED SUCCESSFULLY")
        log("------------------------------------------------------")
    }
}

//yarn hardhat deploy --tags all|mocks

//the above command will only run the deploy scripts with the given tag

module.exports.tags = ["all", "mocks"];