const networkConfig = {
    11155111: {
        name: "sepolia",
        //chainID: "11155111",
        gasPrice: 35000000000,
        ethUSDPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    137: {
        name: "polygon",
        //chainID: "137",
        ethUSDPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER }
