// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@rari-capital/solmate/src/tokens/ERC20.sol";

contract DaiContract is ERC20, Ownable {
    constructor(string memory name, string memory symbol)
        ERC20(name, symbol, 18)
    {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
