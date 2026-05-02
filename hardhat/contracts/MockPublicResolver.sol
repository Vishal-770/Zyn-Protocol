// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract MockPublicResolver {
    mapping(bytes32 => mapping(string => string)) public textRecords;

    function setText(bytes32 node, string calldata key, string calldata value) external {
        textRecords[node][key] = value;
    }

    function text(bytes32 node, string calldata key) external view returns (string memory) {
        return textRecords[node][key];
    }
}
