const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const {
    networkConfig,
    developmentChains,
} = require("../../helper-hardhard-config")

const {
    isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const fundValue = ethers.utils.parseEther("1") // 1 ETH
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              // deploying all contracts
              await deployments.fixture(["all"])
              // get most recently deployed FundMe contract
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", async function () {
              it("sets aggregator to mock for hardhad network", async function () {
                  const response = await fundMe.s_priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          describe("fund", async function () {
              it("fails if not enough ETH sent", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH"
                  )
              })

              it("correctly updates the map of funders", async function () {
                  await fundMe.fund({ value: fundValue })
                  const resFundValue = await fundMe.s_addressToAmt(deployer)
                  const resFunder = await fundMe.s_funders(0)
                  assert.equal(resFundValue.toString(), fundValue.toString())
                  assert.equal(resFunder, deployer)
              })
          })

          describe("withdraw", async function () {
              const withdrawalValue = ethers.utils.parseEther("0.3") // 1 ETH
              beforeEach(async function () {
                  await fundMe.fund({ value: fundValue })
              })

              it("correctly withdaws from a single funder", async function () {
                  const startFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const deployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  const resWithdrawal = await fundMe.withdraw()
                  const txRcpWithdrawal = await resWithdrawal.wait(1)
                  const { cumulativeGasUsed, effectiveGasPrice } =
                      txRcpWithdrawal
                  const gasCost = cumulativeGasUsed.mul(effectiveGasPrice)

                  const endFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  assert.equal(endFundMeBalance, 0)
                  assert.equal(
                      endDeployerBalance.toString(),
                      startFundMeBalance
                          .add(deployerBalance.sub(gasCost))
                          .toString()
                  )

                  await expect(fundMe.s_funders(0)).to.be.reverted
              })
              it("correctly withdraw with multiple funders", async function () {
                  // get example accounts from ethers
                  const ethersSigners = await ethers.getSigners()

                  const numOfFunders = 5
                  let fundMeConnectionWithSigner
                  let startSignerBalances = []
                  let endSignerBalances = []
                  let fundingGasCosts = []
                  let resFunding
                  let txRcpFunding
                  let fundMeStartBalance
                  let fundMeFundedBalance

                  const deployerStartBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  let deployerCurrentBalance

                  fundMeStartBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  let i = 1
                  for (; i <= numOfFunders; i++) {
                      fundMeConnectionWithSigner = await fundMe.connect(
                          ethersSigners[i]
                      )

                      startSignerBalances[i] = await fundMe.provider.getBalance(
                          ethersSigners[i].address
                      )

                      resFunding = await fundMeConnectionWithSigner.fund({
                          value: fundValue,
                      })
                      txRcpFunding = await resFunding.wait(1)
                      fundingGasCosts[i] = txRcpFunding.cumulativeGasUsed.mul(
                          txRcpFunding.effectiveGasPrice
                      )

                      endSignerBalances[i] = await fundMe.provider.getBalance(
                          ethersSigners[i].address
                      )

                      assert.equal(
                          endSignerBalances[i].toString(),
                          startSignerBalances[i]
                              .sub(fundValue)
                              .sub(fundingGasCosts[i])
                              .toString()
                      )
                  }
                  fundMeFundedBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  // chech contract balance after funding
                  assert.equal(
                      fundMeFundedBalance.toString(),
                      fundMeStartBalance.add(fundValue.mul(i - 1).toString())
                  )
                  const resWithdrawal = await fundMe.withdraw()
                  const txRcpWithdrawal = await resWithdrawal.wait(1)
                  const { cumulativeGasUsed, effectiveGasPrice } =
                      txRcpWithdrawal
                  const gasWithdrawalCost =
                      cumulativeGasUsed.mul(effectiveGasPrice)

                  const endFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  deployerCurrentBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  assert.equal(endFundMeBalance, 0)
                  assert.equal(
                      deployerCurrentBalance.toString(),
                      deployerStartBalance
                          .add(fundMeFundedBalance.sub(gasWithdrawalCost))
                          .toString()
                  )
                  await expect(fundMe.s_funders(0)).to.be.reverted
                  for (let j = 1; j <= numOfFunders; j++) {
                      assert.equal(
                          await fundMe.s_addressToAmt(ethersSigners[i].address),
                          0
                      )
                  }
              })
              it("prevents withdrawal by other than Owner", async function () {
                  // get example accounts from ethers
                  const signers = await ethers.getSigners()
                  const fundMeNotOwner = await fundMe.connect(signers[2])
                  await expect(
                      fundMeNotOwner.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
      })
