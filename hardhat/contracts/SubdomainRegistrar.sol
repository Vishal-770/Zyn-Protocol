// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IENSRegistry {
    function setSubnodeRecord(
        bytes32 node,
        bytes32 label,
        address owner,
        address resolver,
        uint64 ttl
    ) external;
    function owner(bytes32 node) external view returns (address);
}

interface IPublicResolver {
    function setText(bytes32 node, string calldata key, string calldata value) external;
}

/// @title SubdomainRegistrar (Zero-Link Version)
/// @notice Registers subdomains to the contract itself and stores secrets 
///         strictly in standard ENS text records on the Official Public Resolver.
contract SubdomainRegistrar is Ownable {
    IENSRegistry private ens;
    IPublicResolver private officialResolver;
    address private stealthResolver;
    bytes32 private parentNode;

    event NameRegistered(
        string name,
        bytes32 indexed label,
        string stealthMetaAddress
    );

    constructor(
        address ensRegistry,
        bytes32 _parentNode,
        address officialResolverAddress,
        address _stealthResolver
    ) Ownable(msg.sender) {
        ens = IENSRegistry(ensRegistry);
        officialResolver = IPublicResolver(officialResolverAddress);
        stealthResolver = _stealthResolver;
        parentNode = _parentNode;
    }

    /**
     * @notice Register a subdomain and set its stealth meta-address.
     * @param name The subdomain label (e.g. "alice" for "alice.zyn.eth")
     * @param stealthMetaAddress The secret meta-address to store in ENS
     */
    function register(
        string calldata name,
        string calldata stealthMetaAddress
    ) external {
        require(isAvailable(name), "Taken");

        bytes32 label = keccak256(bytes(name));
        bytes32 subnode = keccak256(abi.encodePacked(parentNode, label));

        // 1. Register subdomain to this contract (Zero-Link)
        ens.setSubnodeRecord(
            parentNode, 
            label, 
            address(this), 
            stealthResolver, 
            0
        );

        // 2. Set the 'stealth' record on the official resolver
        officialResolver.setText(subnode, "stealth", stealthMetaAddress);

        emit NameRegistered(name, label, stealthMetaAddress);
    }

    /**
     * @notice Check if a subdomain is available for registration.
     * @param name The subdomain label to check.
     */
    function isAvailable(string calldata name) public view returns (bool) {
        bytes32 label = keccak256(bytes(name));
        bytes32 subnode = keccak256(abi.encodePacked(parentNode, label));
        return ens.owner(subnode) == address(0);
    }
}

