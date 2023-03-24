const { network } = require("hardhat")
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhard-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    log(`chainId: ${chainId}`)

    let ethUSDPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const v3 = await deployments.get("MockV3Aggregator")
        ethUSDPriceFeedAddress = v3.address
    } else {
        ethUSDPriceFeedAddress = networkConfig[chainId]["ethUSDPriceFeed"]
    }

    const fundMe = await deploy("FundMe", {
        contract: "FundMe",
        from: deployer,
        args: [ethUSDPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUSDPriceFeedAddress])
    }
    log("01---------------------")
}
module.exports.tags = ["all", "fundme"]
