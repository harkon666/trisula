// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract TrisulaRedeemLog is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    event RedeemRequested(
        address indexed user,
        uint256 indexed serviceId,
        uint256 pointsUsed,
        uint256 timestamp
    );

    constructor(address _admin, address _operator) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _operator);
    }

    function logRedeem(
        address _user,
        uint256 _serviceId,
        uint256 _pointsUsed
    ) external onlyRole(OPERATOR_ROLE) {
        emit RedeemRequested(_user, _serviceId, _pointsUsed, block.timestamp);
    }
}
