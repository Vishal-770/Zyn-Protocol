# Zyn Hardhat Project

This folder contains all smart contracts for the Zyn Web3 privacy dApp.

## Contracts

### SubdomainRegistrar.sol
- Lets users register `name.zyn.eth` subdomains
- Stores wallet addresses and stealth meta-addresses in ENS text records
- Enforces one subdomain per wallet

### StealthResolver.sol
- Simple ENS resolver that stores text records and addresses
- Mock implementation for testing (production uses proper ENS resolver)

### EphemeralAnnouncer.sol
- Public bulletin board for stealth address announcements
- Emits events containing ephemeral public keys and stealth addresses
- Allows receivers to scan payments

### MockENSRegistry.sol
- Mock ENS registry for testing
- Implements `setSubnodeRecord()` for subdomain creation

## Quick Start

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm compile

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Deploy to local Hardhat network (for testing)
pnpm deploy:local

# Deploy to Sepolia testnet
pnpm deploy
```

## Environment Variables

Before deploying to Sepolia, set up `.env.local` in the project root:

```bash
DEPLOYER_PRIVATE_KEY=<your-deployer-private-key>
SEPOLIA_RPC=https://rpc2.sepolia.org
```

## Contract Deployment

The deploy script (`scripts/deploy.ts`) will:

1. Deploy all three contracts
2. Export ABIs and addresses to `../nextjs/lib/contracts.json`
3. Update environment variables in `../nextjs/.env.local`

## Testing

All tests pass ✅

- StealthResolver: 3 tests
- SubdomainRegistrar: 8 tests
- EphemeralAnnouncer: 2 tests

**Total: 13 passing tests**

### Test Coverage

- ✅ Text record storage and retrieval
- ✅ Address storage and retrieval
- ✅ Valid subdomain registration
- ✅ Name validation (length, characters)
- ✅ Duplicate prevention
- ✅ One subdomain per wallet
- ✅ Availability checking
- ✅ Ephemeral announcements
