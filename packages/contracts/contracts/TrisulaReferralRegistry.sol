// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract TrisulaReferralRegistry is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Nasabah -> Agent
    mapping(address => address) public userAgent;

    event ReferralBound(
        address indexed user,
        address indexed agent,
        uint256 timestamp
    );

    constructor(address _admin, address _operator) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _operator);
    }

    function bindReferral(
        address _user,
        address _agent
    ) external onlyRole(OPERATOR_ROLE) {
        require(userAgent[_user] == address(0), "REFERRAL_ALREADY_SET");
        require(_user != _agent, "CANNOT_REFER_SELF");

        userAgent[_user] = _agent;
        emit ReferralBound(_user, _agent, block.timestamp);
    }

    function getAgent(address _user) external view returns (address) {
        return userAgent[_user];
    }
}
