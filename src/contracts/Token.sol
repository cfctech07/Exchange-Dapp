// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20("Xtake", "XTK") {
    address internal minter = msg.sender;

    constructor(address _dex) {
        _mint(_dex, 1_000_000_000e18);
    }

    function mint() external {
        _mint(minter, 10_000e18);
    }
}
