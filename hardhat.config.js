require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xabc"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "dummyKey"
const COINTMARKETCAP = process.env.COINTMARKETCAP || "dummyKey"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 2,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    // solidity: "0.8.7",
    solidity: {
        compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "PLN",
        coinmarketcap: COINTMARKETCAP,
        token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
        },
    },
}
