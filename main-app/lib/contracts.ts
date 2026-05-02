// lib/contracts.ts
// Deployed: 2026-05-03 (Sepolia) - EIP-5564 Compliant

export const CONTRACTS = {
  SUBDOMAIN_REGISTRAR: {
    address: "0x679aEb30E9b816BBcd96A00b00e439182763Bc22" as `0x${string}`,
    abi: [
      {
        "inputs": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "stealthMetaAddress", "type": "string" }
        ],
        "name": "register",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "string", "name": "name", "type": "string" }
        ],
        "name": "isAvailable",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
      }
    ] as const,
  },

  STEALTH_RESOLVER: {
    address: "0xb212019738a34EaA22f43042186a287C23CDcF68" as `0x${string}`,
    abi: [
      {
        "inputs": [
          { "internalType": "bytes", "name": "name", "type": "bytes" },
          { "internalType": "bytes", "name": "data", "type": "bytes" }
        ],
        "name": "resolve",
        "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
        "stateMutability": "view",
        "type": "function"
      }
    ] as const,
  },

  EPHEMERAL_ANNOUNCER: {
    address: "0xA7859177a0EB625a8E5D5e36291EbD1e081De84E" as `0x${string}`,
    abi: [
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "uint256", "name": "schemeId", "type": "uint256" },
          { "indexed": true, "internalType": "address", "name": "stealthAddress", "type": "address" },
          { "indexed": true, "internalType": "address", "name": "caller", "type": "address" },
          { "indexed": false, "internalType": "bytes", "name": "ephemeralPubKey", "type": "bytes" },
          { "indexed": false, "internalType": "bytes", "name": "metadata", "type": "bytes" }
        ],
        "name": "Announcement",
        "type": "event"
      },
      {
        "inputs": [
          { "internalType": "uint256", "name": "schemeId", "type": "uint256" },
          { "internalType": "address", "name": "stealthAddress", "type": "address" },
          { "internalType": "bytes", "name": "ephemeralPubKey", "type": "bytes" },
          { "internalType": "bytes", "name": "metadata", "type": "bytes" }
        ],
        "name": "announce",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint256", "name": "schemeId", "type": "uint256" },
          { "internalType": "address", "name": "stealthAddress", "type": "address" },
          { "internalType": "bytes", "name": "ephemeralPubKey", "type": "bytes" },
          { "internalType": "bytes", "name": "metadata", "type": "bytes" },
          { "internalType": "bytes", "name": "signature", "type": "bytes" }
        ],
        "name": "announceFor",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ] as const,
  },
};
