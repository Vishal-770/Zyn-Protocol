# 🛡️ Zyn Protocol

**Zyn Protocol** is a minimalist, high-privacy stealth payment system for ENS. It implements a "Zero-Link" architecture where identity and financial data are completely decoupled through stateless smart contracts and client-side cryptography.

## 🚀 Key Features

- **Stateless Registration**: Subdomains are registered to the contract itself, breaking the on-chain link between your wallet and your ENS name.
- **Official ENS Integration**: All stealth metadata is stored as standard text records on the **Official ENS Public Resolver**, ensuring your identity lives on decentralized infrastructure.
- **CCIP-Read Resolution**: EIP-3668 compliant gateway allows any standard Ethereum wallet (MetaMask, Rainbow, etc.) to resolve `.zyn.eth` names to one-time stealth addresses.
- **EIP-5564 Compliant**: Uses standard secp256k1 stealth address generation with 1-byte view tags for fast scanning.
- **Private Announcements**: Uses an ephemeral announcer contract to post encrypted "clues" on-chain, allowing recipients to discover payments without revealing the sender.

---

---

## 📖 Subdomain Registration Flow (Full Lifecycle)

The registration of a Zyn subdomain is a carefully orchestrated process designed to break the link between your public identity and your private funds.

### 1. Local Identity Generation (Frontend)
The user's browser generates a pair of cryptographic keys (Spending & Viewing) from a signature. These are used to create the **Stealth Meta-Address**.
*   **Why:** We generate these locally so your private keys **never touch a server**. The Meta-Address is the only thing the world sees; it's like a "public mailbox ID" that doesn't reveal who you are.

### 2. The Availability Check
The frontend calls `isAvailable(name)` on the `SubdomainRegistrar` contract.
*   **Why:** Since ENS is a global namespace, we must ensure the name hasn't already been claimed. This check looks directly at the **ENS Registry** to see if the owner of that name is currently `address(0)`.

### 3. The "Zero-Link" Registration (The Transaction)
The user sends a transaction to `SubdomainRegistrar.register(name, metaAddress)`. This triggers two critical internal steps:

#### A. Ownership Redirection (`setSubnodeRecord`)
The contract tells the ENS Registry to create the subdomain and set the **Registrar Contract** as the owner.
*   **Why:** If *you* were the owner, your wallet address would be permanently linked to your ENS name in the registry logs. By making the **contract** the owner, the trail ends there. Anyone looking at the registry just sees that the Zyn Registrar owns the name.

#### B. Resolver Assignment
The contract sets the name's resolver to the custom **`StealthResolver`**.
*   **Why:** This tells the world: *"If you want to send money to this user, don't ask the standard ENS system; ask the Zyn CCIP-Read bridge instead."*

### 4. Storage of the "Secret" Record (`setText`)
The contract calls `officialResolver.setText(subnode, "stealth", metaAddress)`.
*   **Why:** We store the meta-address on the **Official ENS Public Resolver** rather than a custom database. This ensures your data is as decentralized and permanent as any other ENS name.

### 5. Event Emission (`NameRegistered`)
The contract emits an event with the name and meta-address.
*   **Why:** This allows the **Indexer (The Graph)** to pick up the registration instantly. While the ENS Registry is private, the protocol needs to index these registrations so users can see their active identities in the Dashboard.

---

## 💸 The Zyn Payment Lifecycle (Technical Deep-Dive)

This section outlines the exact path a payment takes through the protocol, from discovery to withdrawal.

<svg width="100%" viewBox="0 0 680 1580" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Group -->
  <g fill="none" stroke="none">
    <rect width="680" height="1580" fill="transparent"/>
  </g>

  <!-- Phase 1 — Setup (Recipient) -->
  <g>
    <rect x="60" y="24" width="560" height="28" rx="7" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5" opacity="0.65"/>
    <text x="340" y="43" text-anchor="middle" font-size="14" fill="#CECBE6" font-family="sans-serif" font-weight="500">Phase 1 — Setup (Recipient)</text>
  </g>

  <!-- 1A -->
  <g>
    <rect x="60" y="72" width="560" height="72" rx="10" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5"/>
    <text x="340" y="100" text-anchor="middle" font-size="14" fill="#CECBE6" font-family="sans-serif" font-weight="500">Key generation</text>
    <text x="340" y="120" text-anchor="middle" font-size="12" fill="#AFA9EC" font-family="sans-serif">Signature-derived entropy → Spending &amp; Viewing keypairs → Stealth Meta-Address</text>
    <text x="340" y="137" text-anchor="middle" font-size="12" fill="#AFA9EC" font-family="sans-serif" opacity="0.55">keys.ts → generateStealthKeypairs</text>
  </g>

  <!-- 1B -->
  <g>
    <rect x="60" y="178" width="560" height="72" rx="10" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5"/>
    <text x="340" y="206" text-anchor="middle" font-size="14" fill="#CECBE6" font-family="sans-serif" font-weight="500">Zero-link registration</text>
    <text x="340" y="226" text-anchor="middle" font-size="12" fill="#AFA9EC" font-family="sans-serif">alice.zyn.eth registered — Registrar contract set as ENS owner, not user wallet</text>
    <text x="340" y="243" text-anchor="middle" font-size="12" fill="#AFA9EC" font-family="sans-serif" opacity="0.55">SubdomainRegistrar.sol → register</text>
  </g>

  <!-- 1C -->
  <g>
    <rect x="60" y="284" width="560" height="72" rx="10" fill="#3C3489" stroke="#AFA9EC" stroke-width="0.5"/>
    <text x="340" y="312" text-anchor="middle" font-size="14" fill="#CECBE6" font-family="sans-serif" font-weight="500">Standard storage</text>
    <text x="340" y="332" text-anchor="middle" font-size="12" fill="#AFA9EC" font-family="sans-serif">Meta-address stored via officialResolver.setText → permanent, ENS-compatible</text>
    <text x="340" y="349" text-anchor="middle" font-size="12" fill="#AFA9EC" font-family="sans-serif" opacity="0.55">SubdomainRegistrar.sol → officialResolver.setText</text>
  </g>

  <!-- Phase 2 — Discovery & Math (Sender) -->
  <g>
    <rect x="60" y="408" width="560" height="28" rx="7" fill="#085041" stroke="#5DCAA5" stroke-width="0.5" opacity="0.65"/>
    <text x="340" y="427" text-anchor="middle" font-size="14" fill="#9FE1CB" font-family="sans-serif" font-weight="500">Phase 2 — Discovery &amp; Math (Sender)</text>
  </g>

  <!-- 2A -->
  <g>
    <rect x="60" y="456" width="560" height="72" rx="10" fill="#085041" stroke="#5DCAA5" stroke-width="0.5"/>
    <text x="340" y="484" text-anchor="middle" font-size="14" fill="#9FE1CB" font-family="sans-serif" font-weight="500">ENS resolution</text>
    <text x="340" y="504" text-anchor="middle" font-size="12" fill="#5DCAA5" font-family="sans-serif">Fetch meta-address from alice.zyn.eth — retrieves recipient's keys</text>
    <text x="340" y="521" text-anchor="middle" font-size="12" fill="#5DCAA5" font-family="sans-serif" opacity="0.55">ens.ts → getStealthMetaAddress</text>
  </g>

  <!-- 2B -->
  <g>
    <rect x="60" y="562" width="560" height="72" rx="10" fill="#085041" stroke="#5DCAA5" stroke-width="0.5"/>
    <text x="340" y="590" text-anchor="middle" font-size="14" fill="#9FE1CB" font-family="sans-serif" font-weight="500">Stealth address generation</text>
    <text x="340" y="610" text-anchor="middle" font-size="12" fill="#5DCAA5" font-family="sans-serif">Compute one-time Stealth Address (0xABC…) + Ephemeral Public Key (clue)</text>
    <text x="340" y="627" text-anchor="middle" font-size="12" fill="#5DCAA5" font-family="sans-serif" opacity="0.55">stealth.ts → generateStealthAddress</text>
  </g>

  <!-- Phase 3 — Execution & Privacy -->
  <g>
    <rect x="60" y="686" width="560" height="28" rx="7" fill="#712B13" stroke="#F0997B" stroke-width="0.5" opacity="0.65"/>
    <text x="340" y="705" text-anchor="middle" font-size="14" fill="#F5C4B3" font-family="sans-serif" font-weight="500">Phase 3 — Execution &amp; Privacy (The Handshake)</text>
  </g>

  <!-- 3A -->
  <g>
    <rect x="60" y="734" width="264" height="140" rx="10" fill="#712B13" stroke="#F0997B" stroke-width="0.5"/>
    <text x="192" y="770" text-anchor="middle" font-size="14" fill="#F5C4B3" font-family="sans-serif" font-weight="500">Direct transfer</text>
    <text x="192" y="790" text-anchor="middle" font-size="12" fill="#F0997B" font-family="sans-serif">ETH sent directly to Stealth Address</text>
    <text x="192" y="810" text-anchor="middle" font-size="12" fill="#F0997B" font-family="sans-serif">Fresh address — no link</text>
  </g>

  <!-- 3B -->
  <g>
    <rect x="356" y="734" width="264" height="140" rx="10" fill="#712B13" stroke="#F0997B" stroke-width="0.5"/>
    <text x="488" y="770" text-anchor="middle" font-size="14" fill="#F5C4B3" font-family="sans-serif" font-weight="500">Relayed announcement</text>
    <text x="488" y="790" text-anchor="middle" font-size="12" fill="#F0997B" font-family="sans-serif">Ephemeral key sent to Zyn Relayer</text>
    <text x="488" y="810" text-anchor="middle" font-size="12" fill="#F0997B" font-family="sans-serif">Relayer posts clue to chain</text>
  </g>

  <!-- 3C -->
  <g>
    <rect x="60" y="930" width="560" height="72" rx="10" fill="#712B13" stroke="#F0997B" stroke-width="0.5"/>
    <text x="340" y="958" text-anchor="middle" font-size="14" fill="#F5C4B3" font-family="sans-serif" font-weight="500">Stateless event</text>
    <text x="340" y="978" text-anchor="middle" font-size="12" fill="#F0997B" font-family="sans-serif">Announcement emitted on-chain — no state written</text>
    <text x="340" y="995" text-anchor="middle" font-size="12" fill="#F0997B" font-family="sans-serif" opacity="0.55">EphemeralAnnouncer.sol → announce</text>
  </g>

  <!-- Phase 4 — Discovery & Sweep -->
  <g>
    <rect x="60" y="1054" width="560" height="28" rx="7" fill="#27500A" stroke="#97C459" stroke-width="0.5" opacity="0.65"/>
    <text x="340" y="1073" text-anchor="middle" font-size="14" fill="#C0DD97" font-family="sans-serif" font-weight="500">Phase 4 — Discovery &amp; Sweep (Recipient)</text>
  </g>

  <!-- 4A -->
  <g>
    <rect x="60" y="1102" width="560" height="72" rx="10" fill="#27500A" stroke="#97C459" stroke-width="0.5"/>
    <text x="340" y="1130" text-anchor="middle" font-size="14" fill="#C0DD97" font-family="sans-serif" font-weight="500">Instant indexing</text>
    <text x="340" y="1150" text-anchor="middle" font-size="12" fill="#97C459" font-family="sans-serif">The Graph picks up Announcement for filtered retrieval</text>
    <text x="340" y="1167" text-anchor="middle" font-size="12" fill="#97C459" font-family="sans-serif" opacity="0.55">indexer/src/ephemeral-announcer.ts</text>
  </g>

  <!-- 4B -->
  <g>
    <rect x="60" y="1208" width="560" height="72" rx="10" fill="#27500A" stroke="#97C459" stroke-width="0.5"/>
    <text x="340" y="1236" text-anchor="middle" font-size="14" fill="#C0DD97" font-family="sans-serif" font-weight="500">Private scanning</text>
    <text x="340" y="1256" text-anchor="middle" font-size="12" fill="#97C459" font-family="sans-serif">Browser queries Indexer + applies Viewing Key locally</text>
    <text x="340" y="1273" text-anchor="middle" font-size="12" fill="#97C459" font-family="sans-serif" opacity="0.55">SweepDashboard.tsx → checkStealthAddress</text>
  </g>

  <!-- 4C -->
  <g>
    <rect x="60" y="1314" width="560" height="72" rx="10" fill="#27500A" stroke="#97C459" stroke-width="0.5"/>
    <text x="340" y="1342" text-anchor="middle" font-size="14" fill="#C0DD97" font-family="sans-serif" font-weight="500">Key derivation &amp; sweep</text>
    <text x="340" y="1362" text-anchor="middle" font-size="12" fill="#97C459" font-family="sans-serif">Spending key + clue → one-time private key derived → funds swept</text>
    <text x="340" y="1379" text-anchor="middle" font-size="12" fill="#97C459" font-family="sans-serif" opacity="0.55">SweepDashboard.tsx → onSweep</text>
  </g>

  <!-- Legend -->
  <rect x="60" y="1424" width="560" height="40" rx="8" fill="none" stroke="#DEDCD1" stroke-width="0.5" stroke-dasharray="4 3" opacity="0.4"/>
  <text x="340" y="1449" text-anchor="middle" font-size="12" fill="#C2C0B6" font-family="sans-serif" opacity="0.5">Zyn Protocol Technical Flowchart</text>
</svg>


### 1. Setup (The Recipient)
*   **Key Generation**: Recipient generates a **Stealth Meta-Address** locally via a signature-derived entropy source.
    *   *Ref:* [`main-app/lib/keys.ts`](file:///d:/Web3/zyn/main-app/lib/keys.ts) -> `generateStealthKeypairs`
    *   **Why:** Privacy begins with local entropy. By generating these keys from a signature, we ensure the server never sees the private "master" keys.
*   **Zero-Link Registration**: Recipient registers a name (e.g., `alice.zyn.eth`) where the **Registrar Contract** is the owner.
    *   *Ref:* [`hardhat/contracts/SubdomainRegistrar.sol`](file:///d:/Web3/zyn/hardhat/contracts/SubdomainRegistrar.sol) -> `register`
    *   **Why:** If the user were the owner, their wallet would be permanently linked to the name. Making the contract the owner breaks the on-chain trail.
*   **Standard Storage**: The meta-address is stored in the **Official ENS Public Resolver**.
    *   *Ref:* [`hardhat/contracts/SubdomainRegistrar.sol`](file:///d:/Web3/zyn/hardhat/contracts/SubdomainRegistrar.sol) -> `officialResolver.setText`
    *   **Why:** This ensures data is permanent and follows ENS standards, making it compatible with any wallet that knows how to read ENS text records.

### 2. Discovery & Math (The Sender)
*   **Resolution**: Sender fetches the Meta-Address record using Alice's ENS name.
    *   *Ref:* [`main-app/lib/ens.ts`](file:///d:/Web3/zyn/main-app/lib/ens.ts) -> `getStealthMetaAddress`
    *   **Why:** The sender needs the recipient's public keys to "blind" the payment address.
*   **Stealth Generation**: Sender's browser computes a one-time **Stealth Address** and an **Ephemeral Public Key** (clue).
    *   *Ref:* [`main-app/lib/stealth.ts`](file:///d:/Web3/zyn/main-app/lib/stealth.ts) -> `generateStealthAddress`
    *   **Why:** The stealth address (0xABC...) is unique and has no history. This prevents "address reuse" and makes it impossible for observers to know who the recipient is.

### 3. Execution & Privacy (The Handshake)
*   **Direct Transfer**: Sender sends ETH directly to the generated Stealth Address.
    *   **Why:** The money sits on a fresh address that only the recipient can unlock.
*   **Relayed Announcement**: Sender sends the ephemeral key to the **Zyn Relayer** to be posted on-chain.
    *   *Ref:* [`main-app/app/api/relay-announce/route.ts`](file:///d:/Web3/zyn/main-app/app/api/relay-announce/route.ts)
    *   **Why:** If the sender posted the clue directly, their wallet would be linked to the payment. The relayer acts as an anonymity bridge for the notification.
*   **Stateless Event**: The contract emits an `Announcement` event. No data is stored in contract state.
    *   *Ref:* [`hardhat/contracts/EphemeralAnnouncer.sol`](file:///d:/Web3/zyn/hardhat/contracts/EphemeralAnnouncer.sol) -> `announce`
    *   **Why:** Events are significantly cheaper than storage. This keeps the cost of private payments nearly identical to public ones.

### 4. Discovery & Sweep (The Recipient)
*   **Instant Indexing**: The Graph Subgraph picks up the event and indexes the `viewTag` for fast retrieval.
    *   *Ref:* [`indexer/src/ephemeral-announcer.ts`](file:///d:/Web3/zyn/indexer/src/ephemeral-announcer.ts)
    *   **Why:** Scanning the whole blockchain is slow. The indexer provides a fast, filtered API for the dashboard.
*   **Private Scanning**: Recipient's browser queries the Indexer and uses the **Private Viewing Key** to "unlock" the math and find their funds.
    *   *Ref:* [`main-app/components/SweepDashboard.tsx`](file:///d:/Web3/zyn/main-app/components/SweepDashboard.tsx) -> `checkStealthAddress`
    *   **Why:** The indexer doesn't know who is querying. Only the recipient's local browser can verify if a payment belongs to them.
*   **Recovery**: Recipient derives the one-time **Spending Private Key** and sweeps the funds.
    *   *Ref:* [`main-app/components/SweepDashboard.tsx`](file:///d:/Web3/zyn/main-app/components/SweepDashboard.tsx) -> `onSweep`
    *   **Why:** The recipient combines their base spending key with the sender's clue to "derive" the final private key for the one-time address.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (Turbopack), TailwindCSS, Shadcn/UI.
- **Web3**: Wagmi, Viem, ENS SDK.
- **Smart Contracts**: Solidity 0.8.27, Hardhat, OpenZeppelin.
- **Gateway**: Next.js API Routes (EIP-3668).

---

## 🔍 Technical Deep-Dive: Next.js (Frontend & Gateway)

### 1. CCIP-Read Resolution (EIP-3668)
The project implements a **CCIP-Read Gateway** in `/app/api/resolve/route.ts`. When a wallet (like MetaMask) attempts to resolve `alice.zyn.eth`, the `StealthResolver` contract tells the wallet to fetch data from our API.
- **Logic**: The API fetches Alice's "Meta-Address" from the Official ENS Public Resolver and performs the elliptic curve derivation on the fly.
- **Security**: Responses are signed by the `RELAYER_PRIVATE_KEY`. The contract verifies this signature on-chain before returning the address, ensuring the gateway cannot lie about the result.

### 2. Client-Side Payment Recovery
All "View" and "Spend" keys are generated locally and encrypted using a wallet-signed master key.
- **Scanning**: The `SweepDashboard` queries the `EphemeralAnnouncer` logs. It performs the "Stealth Match" math entirely in the browser. 
- **Privacy**: No private keys or viewing secrets are ever sent to the server or RPC. The RPC only sees requests for raw event data.

---

## ⛓️ Technical Deep-Dive: Hardhat (Contracts)

### 1. Ephemeral Bulletin Board (EIP-5564)
The `EphemeralAnnouncer` is a gas-optimized "bulletin board."
- **Efficiency**: It uses **zero storage**. It only emits events. This reduces the cost of "announcing" a payment by ~90% compared to traditional on-chain state.
- **Standard**: It follows EIP-5564, using the `Announcement` event format that is compatible with future stealth-address explorers.

### 2. Stateless Subdomain Registration
The `SubdomainRegistrar` is an "Orphan Maker."
- **Ownership**: When you register `name.zyn.eth`, the contract sets **itself** as the owner in the ENS Registry. 
- **Link Breaking**: Because the contract owns the name, there is no `ownerOf` record pointing to your wallet. The only link to your identity is the text record pointing to your meta-address, which is itself a "silent" public key.

---

## 🚦 Getting Started

### 1. Smart Contracts (Hardhat)
```bash
cd hardhat
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

### 2. Frontend (Main App)
```bash
cd main-app
pnpm install
pnpm dev
```

### 3. Environment Setup (`.env.local`)
The deployment script automatically generates these, but ensure they are set:
- `NEXT_PUBLIC_SUBDOMAIN_REGISTRAR_ADDRESS`: The registrar contract.
- `NEXT_PUBLIC_STEALTH_RESOLVER_ADDRESS`: The CCIP-Read resolver.
- `NEXT_PUBLIC_EPHEMERAL_ANNOUNCER_ADDRESS`: The announcement board.
- `RELAYER_PRIVATE_KEY`: Hex-encoded key for signing CCIP responses.

---

## ⚠️ Important ENS Manager Steps

To make the system functional on Sepolia:
1.  **Add Controller**: You MUST add the `SubdomainRegistrar` contract address as a **Controller/Manager** for `zyn.eth` in the [ENS Manager](https://app.ens.domains/).
2.  **Set Resolver**: Ensure `zyn.eth` is using the Official Public Resolver (not the StealthResolver itself). The system handles the rest.

---


---

## 📄 License
MIT
