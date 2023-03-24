// SPDX-License-Identifier: MIT

pragma solidity ^0.5.8;

import "./PriceConverter.sol";
error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MIN_USD = 5;
    address immutable i_owner;
    // address constant aggregatorAddress =
    //     0x694AA1769357215DE4FAC081bf1f309aDC325306;
    AggregatorV3Interface public s_priceFeed;
    address[] public s_funders;

    mapping(address => uint256) public s_addressToAmt;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner() {
        // require(msg.sender == i_owner,"Why are you stealing??");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    function fund() public payable {
        require(
            msg.value.convertWeitoUSD(s_priceFeed) > MIN_USD,
            "You need to spend more ETH"
        );
        s_funders.push(msg.sender);
        s_addressToAmt[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        address[] memory m_funders = s_funders;

        // zero out all mapping
        for (
            uint256 funderIndex = 0;
            funderIndex < m_funders.length;
            funderIndex++
        ) {
            address funder = m_funders[funderIndex];
            s_addressToAmt[funder] = 0;
        }
        // transfer the balance
        s_funders = new address[](0);
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
