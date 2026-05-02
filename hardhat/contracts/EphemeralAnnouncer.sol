// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// @title EphemeralAnnouncer
/// @notice EIP-5564 compliant public bulletin board for stealth address ephemeral keys.
///         Permissionless — anyone can call announce().
///         No storage — emits events only (cheaper gas).
contract EphemeralAnnouncer {
    /// @notice Emitted when a sender announces a stealth payment
    /// @param schemeId     EIP-5564 scheme ID — always 0 for secp256k1
    /// @param stealthAddress  The one-time address funds were sent to
    /// @param caller       msg.sender or recovered from signature
    /// @param ephemeralPubKey  33-byte compressed ephemeral public key
    /// @param metadata     Contains the 1-byte viewTag
    event Announcement(
        uint256 indexed schemeId,
        address indexed stealthAddress,
        address indexed caller,
        bytes ephemeralPubKey,
        bytes metadata
    );

    /// @notice Announce a stealth payment on-chain so the receiver can find it
    /// @param schemeId         Always pass 0 for secp256k1
    /// @param stealthAddress   The one-time address you sent ETH to
    /// @param ephemeralPubKey  33-byte compressed ephemeral public key
    /// @param metadata         Contains the 1-byte viewTag
    function announce(
        uint256 schemeId,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external {
        emit Announcement(schemeId, stealthAddress, msg.sender, ephemeralPubKey, metadata);
    }

    /// @notice Relayed announcement to hide the sender's wallet on-chain
    /// @param schemeId         Always pass 0 for secp256k1
    /// @param stealthAddress   The one-time address you sent ETH to
    /// @param ephemeralPubKey  33-byte compressed ephemeral public key
    /// @param metadata         Contains the 1-byte viewTag
    /// @param signature        Authorization signature from the relayer (optional in this version)
    function announceFor(
        uint256 schemeId,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata,
        bytes calldata signature
    ) external {
        bytes32 payloadHash = keccak256(
            abi.encodePacked(schemeId, stealthAddress, ephemeralPubKey, metadata)
        );
        bytes32 ethHash = MessageHashUtils.toEthSignedMessageHash(payloadHash);
        address recovered = ECDSA.recover(ethHash, signature);
        
        emit Announcement(schemeId, stealthAddress, recovered, ephemeralPubKey, metadata);
    }
}
