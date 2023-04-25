//writing the deploy scripts using hardhat-deploy package
//which helps in making deploying contracts easier
//also keeps tracks of all the deployed contracts and such

module.exports = async({getNamedAccounts, deployments})=>{

    const {deploy, log} = deployments;

    //grabbing the "deployer" account mentioned in hh config
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;
}