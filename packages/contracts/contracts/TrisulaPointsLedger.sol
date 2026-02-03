// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract TrisulaPointsLedger is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    event PointsAdded(
        address indexed user,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    event PointsDeducted(
        address indexed user,
        uint256 amount,
        string reason,
        uint256 timestamp
    );

    constructor(address _admin, address _operator) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _operator);
    }

    function addPoints(
        address _user,
        uint256 _amount,
        string calldata _reason
    ) external onlyRole(OPERATOR_ROLE) {
        emit PointsAdded(_user, _amount, _reason, block.timestamp);
    }

    function deductPoints(
        address _user,
        uint256 _amount,
        string calldata _reason
    ) external onlyRole(OPERATOR_ROLE) {
        emit PointsDeducted(_user, _amount, _reason, block.timestamp);
    }
}
