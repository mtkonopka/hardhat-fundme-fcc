// SPDX-License-Identifier: MIT

pragma solidity ^0.5.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    address constant aggregatorAddress =
        0x694AA1769357215DE4FAC081bf1f309aDC325306;

    function getETHPriceInUSD(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price / 1e8); // conversion to Wei
    }

    function convertWeitoUSD(
        uint256 weiAmt,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        return (weiAmt * getETHPriceInUSD(priceFeed)) / 1e18;
    }
}
