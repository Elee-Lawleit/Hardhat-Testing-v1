const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
describe("FundMe", function () {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1") //1 ETH
    beforeEach(async function () {
        //deploy FundMe contract using hardhat-deploy

        //allows us to run our ENTIRE "deploy" folder with as many tags as we want

        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])

        //get the most recently deployed FundMe contract
        //connecting deployer account, so all transactions we make are going to be from this account
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async function () {
            //getting the address stored in the public address object inside the contract
            const response = await fundMe.priceFeedObject()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function () {
        it("Fails if you don't send enough eth", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "Must send greater than 50 dollars!"
            )
        })
        it("updated the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue })
            const respose = await fundMe.addressToAmoutDonated(deployer)
            assert.equal(respose.toString(), sendValue.toString())
        })
        it("adds funders to array of funders", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
    })
    describe("widthdraw", async function () {
        //funding before testing withdrawing
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })

        //withdrawing with only one funder
        it("Withdraw ETH from a single funder", async function () {
            // Arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act
            const txReponse = await fundMe.widthdraw()
            const txRecepit = await txReponse.wait(1)

            //finding out the total gas used for widthdraw transaction
            const { gasUsed, effectiveGasPrice } = txRecepit
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Assert
            assert.equal(endingFundMeBalance, 0) //contract balance should become zero, because we just took everything out

            // money the contract started with + money the withdrawer started with

            //ending balance of withdrawer PLUS the gas he used in that transaction

            // the ending balance of the withdrawer is going to be a ˡⁱᵗᵗˡᵉ ᵇⁱᵗ less (because of gas cost for tx), so need to add the gas used as well
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
        //withdrawing with multiple funders
        it("allows us to withdraw with mutiple funders", async function () {
            // ARRANGE

            //getting all the accounts from the network
            //by default it's hardhat, otherwise, they will come from the network.config file
            const accounts = await ethers.getSigners()

            //first, let's fund the contract with multiple accounts

            //starting the funding from account 1, because 0 is the deployer set in the config file
            for (let i = 1; i < 6; i++) {
                //the fundMe contract is connected to the deployer by default, so  we first connect it to other accounts
                //so that the fund commands are not run through deployer account
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )

                //actually funding the contract
                await fundMeConnectedContract.fund({ value: sendValue })
                const startingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const startingDeployerBalance =
                    await fundMe.provider.getBalance(deployer)

                //ACT

                const txResponse = await fundMe.widthdraw()
                const txReceipt = await txResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = txReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                // ASSERT
                const endingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const endingDeployerBalance = await fundMe.provider.getBalance(
                    deployer
                )

                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance
                        .add(startingDeployerBalance)
                        .toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )

                //Testing whether the funders are reset properly after withdrawal or not
                //because if the array is empty, it will throw an error
                await expect(fundMe.funders(0)).to.be.reverted

                for (i = 1; i < 6; i++) {
                    assert.equal(
                        await fundMe.addressToAmoutDonated(accounts[i].address),
                        0
                    )
                }
            }
        })
        it("only allows owner to widthdraw", async function () {
            const accounts = await ethers.getSigners()
            const attackerConnectedContract = await fundMe.connect(accounts[1])

            await expect(
                attackerConnectedContract.widthdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
    })
})
