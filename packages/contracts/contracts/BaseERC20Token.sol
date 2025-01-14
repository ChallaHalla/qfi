// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.7.2;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract BaseERC20Token is ERC20 {
  constructor(uint256 initialSupply)
    ERC20('Any old ERC20 token', 'AOE')
  {
    _mint(msg.sender, initialSupply);
  }
}
