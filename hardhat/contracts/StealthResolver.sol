// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title StealthResolver
 * @notice Implements EIP-3668 (CCIP-Read) to redirect ENS lookups to a backend API.
 *         The backend API fetches 'stealth' records from the Official ENS Resolver 
 *         and computes fresh stealth addresses on the fly.
 */
contract StealthResolver {
    address public owner;
    address public signer; // The backend key that signs responses
    string public url;    // Backend API URL

    error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData);

    constructor(string memory _url, address _signer) {
        owner = msg.sender;
        url = _url;
        signer = _signer;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setUrl(string calldata _url) external onlyOwner {
        url = _url;
    }

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    /**
     * @notice ENS resolution entry point (EIP-3668).
     */
    function resolve(bytes calldata name, bytes calldata data) external view returns (bytes memory) {
        string[] memory urls = new string[](1);
        urls[0] = url;

        revert OffchainLookup(
            address(this),
            urls,
            data,
            StealthResolver.resolveWithProof.selector,
            abi.encode(name, data)
        );
    }

    /**
     * @notice Callback for CCIP-Read. 
     *         Verifies the signature from the backend.
     */
    function resolveWithProof(bytes calldata response, bytes calldata extraData) external view returns (bytes memory) {
        (bytes memory result, uint64 expires, bytes memory sig) = abi.decode(response, (bytes, uint64, bytes));

        require(block.timestamp < expires, "Response expired");

        // The hash must match what the backend signs
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                hex"1900",
                address(this),
                expires,
                keccak256(extraData),
                keccak256(result)
            )
        );

        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address recovered = ECDSA.recover(ethSignedHash, sig);
        require(recovered == signer, "Invalid signature");

        return result;
    }

    // Support for ENS interface detection
    function supportsInterface(bytes4 interfaceID) external pure returns (bool) {
        return interfaceID == 0x01ffc9a7 || // ERC165
               interfaceID == 0x9061b923;    // resolve(bytes,bytes)
    }
}

