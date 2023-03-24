const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const {
    networkConfig,
    developmentChains,
} = require("../../helper-hardhard-config")

const {
    isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          const fundValue = ethers.utils.parseEther("1") // 1 ETH
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              // deploying all contracts
              // await deployments.fixture(["all"])
              // get most recently deployed FundMe contract
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows fund and withdraw", async function () {
              await fundMe.fund({ value: fundValue })
              await fundMe.withdraw()
              const fmBalance = await fundMe.provider.getBalance(fundMe.address)
              assert.equal(fmBalance.toString(), "0")
          })
      })
