# Zyn StealthPay Architecture Plan (Zero-Link Version)

## 1. Core Principles
- **Anonymity**: No on-chain link between a user's wallet address and their registered ENS subdomain.
- **Official Storage**: All public secrets (Stealth Meta-Addresses) are stored as standard `stealth` text records in the **Official ENS Public Resolver**.
- **Backend Calculator**: A CCIP-Read gateway (`/api/resolve`) fetches secrets from the Official ENS contract and performs the stealth address math.
- **Local Identity**: The connection between a wallet and an ENS name exists **only** in the user's browser `localStorage`.

## 2. Smart Contracts
### SubdomainRegistrar.sol
- **Stateless**: No mappings of `address -> name`.
- **Owner**: Sets itself (`address(this)`) as the owner of all subdomains in the ENS Registry.
- **Setup**: Configures subdomains to use the `StealthResolver` and sets the `stealth` text record on the **Official ENS Public Resolver**.

### StealthResolver.sol
- **Gateway**: Implements EIP-3668 (CCIP-Read).
- **Redirect**: Points standard `addr` lookups to the Backend API (`/api/resolve`).

### EphemeralAnnouncer.sol
- **Announce**: Standard contract for recording stealth payment metadata (ephemeral keys, view tags).

## 3. Frontend & LocalStorage
- **Registration**: 
  1. Generate spending/viewing keys locally.
  2. Save `{ walletAddress: { name, keys } }` in `localStorage`.
  3. Register via Registrar.
- **Scanning**: 
  1. Retrieve keys from `localStorage` based on the connected wallet.
  2. Scan `EphemeralAnnouncer` events and decrypt locally.
- **Sending**: 
  1. Resolve `name.zyn.eth` (triggers CCIP-Read).
  2. Receive generated address from Backend.
  3. Send ETH and Announce.

## 4. Backend API (`/api/resolve`)
- **Fetch**: Performs a standard `getEnsText` call to the **Official ENS Public Resolver** for the requested name.
- **Math**: Uses the retrieved `stealth` secret to generate a fresh one-time address.
- **Return**: Sends the address and ephemeral key back to the Sender.

---
**Status**: Final Truth (Do Not Change)
