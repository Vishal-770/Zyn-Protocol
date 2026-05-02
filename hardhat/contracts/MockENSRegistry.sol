// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

contract MockENSRegistry {
    mapping(bytes32 => address) public owner;

    function setSubnodeRecord(
        bytes32 node,
        bytes32 label,
        address newOwner,
        address resolver,
        uint64 ttl
    ) external {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        owner[subnode] = newOwner;
    }
}
