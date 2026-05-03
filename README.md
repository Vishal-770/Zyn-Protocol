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

<svg width="100%" viewBox="0 0 680 1580" role="img" xmlns="http://www.w3.org/2000/svg">
  <title style="fill:rgb(0, 0, 0);stroke:none;color:rgb(255, 255, 255);stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;opacity:1;font-family:&quot;Anthropic Sans&quot;, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif;font-size:16px;font-weight:400;text-anchor:start;dominant-baseline:auto">Zyn payment lifecycle technical flowchart</title>
  <desc style="fill:rgb(0, 0, 0);stroke:none;color:rgb(255, 255, 255);stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;opacity:1;font-family:&quot;Anthropic Sans&quot;, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif;font-size:16px;font-weight:400;text-anchor:start;dominant-baseline:auto">Four-phase flowchart covering recipient setup, sender discovery and math, the stealth handshake execution, and recipient discovery and sweep.</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  <mask id="imagine-text-gaps-snhmfx" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="680" height="1580" fill="white"/><rect x="243.07501220703125" y="27.4666690826416" width="193.85000610351562" height="22.13333511352539" fill="black" rx="2"/><rect x="285.9416809082031" y="85.4666748046875" width="109.2440185546875" height="22.13333511352539" fill="black" rx="2"/><rect x="102.47500610351562" y="106.53334045410156" width="475.286865234375" height="18.933334350585938" fill="black" rx="2"/><rect x="238.95834350585938" y="123.53334045410156" width="203.386474609375" height="18.933334350585938" fill="black" rx="2"/><rect x="301.6750183105469" y="66.13333892822266" width="77.32464599609375" height="15.733333587646484" fill="black" rx="2"/><rect x="264.808349609375" y="191.4666748046875" width="150.4473114013672" height="22.13333511352539" fill="black" rx="2"/><rect x="115.90834045410156" y="212.53334045410156" width="447.425537109375" height="18.933334350585938" fill="black" rx="2"/><rect x="239.1416778564453" y="229.53334045410156" width="201.1377716064453" height="18.933334350585938" fill="black" rx="2"/><rect x="277.7083435058594" y="297.4666748046875" width="124.92109680175781" height="22.13333511352539" fill="black" rx="2"/><rect x="112.92500305175781" y="318.5333557128906" width="455.7267761230469" height="18.933334350585938" fill="black" rx="2"/><rect x="195.36668395996094" y="335.5333557128906" width="288.4976806640625" height="18.933334350585938" fill="black" rx="2"/><rect x="264.54168701171875" y="370.5333557128906" width="150.15586853027344" height="18.933334350585938" fill="black" rx="2"/><rect x="210.4666748046875" y="411.4666748046875" width="259.0666809082031" height="22.13333511352539" fill="black" rx="2"/><rect x="286.5250244140625" y="469.4667053222656" width="108.08242797851562" height="21.066667556762695" fill="black" rx="2"/><rect x="73.7750015258789" y="490.5333557128906" width="533.7521362304688" height="18.933334350585938" fill="black" rx="2"/><rect x="242.8583526611328" y="507.5333557128906" width="194.51113891601562" height="18.933334350585938" fill="black" rx="2"/><rect x="245.308349609375" y="575.4666748046875" width="189.4434356689453" height="22.13333511352539" fill="black" rx="2"/><rect x="118.01667022705078" y="596.5333862304688" width="443.36956787109375" height="18.933334350585938" fill="black" rx="2"/><rect x="231.99168395996094" y="613.5333862304688" width="216.2490997314453" height="18.933334350585938" fill="black" rx="2"/><rect x="284.308349609375" y="648.5333862304688" width="112.67259979248047" height="18.933334350585938" fill="black" rx="2"/><rect x="176.08334350585938" y="689.4666748046875" width="327.8333435058594" height="22.13333511352539" fill="black" rx="2"/><rect x="138.65834045410156" y="751.4667358398438" width="107.32451629638672" height="21.066667556762695" fill="black" rx="2"/><rect x="139.27500915527344" y="774.5333862304688" width="107.12723541259766" height="18.933334350585938" fill="black" rx="2"/><rect x="134.5500030517578" y="792.5333862304688" width="115.13121032714844" height="18.933334350585938" fill="black" rx="2"/><rect x="140.8416748046875" y="814.5333862304688" width="103.1079330444336" height="18.933334350585938" fill="black" rx="2"/><rect x="139.2583465576172" y="832.5333862304688" width="107.20523071289062" height="18.933334350585938" fill="black" rx="2"/><rect x="405.8000183105469" y="751.4667358398438" width="165.8742218017578" height="22.13333511352539" fill="black" rx="2"/><rect x="428.54168701171875" y="774.5333862304688" width="119.21524047851562" height="18.933334350585938" fill="black" rx="2"/><rect x="442.57501220703125" y="792.5333862304688" width="90.28190612792969" height="18.933334350585938" fill="black" rx="2"/><rect x="432.72503662109375" y="810.5333862304688" width="112.1312255859375" height="18.933334350585938" fill="black" rx="2"/><rect x="416.2750244140625" y="828.5333862304688" width="144.74252319335938" height="18.933334350585938" fill="black" rx="2"/><rect x="283.5333557128906" y="943.4667358398438" width="113.33438110351562" height="21.066667556762695" fill="black" rx="2"/><rect x="72.36666870117188" y="964.5333862304688" width="534.6893310546875" height="18.933334350585938" fill="black" rx="2"/><rect x="229.92501831054688" y="981.5333862304688" width="221.72715759277344" height="18.933334350585938" fill="black" rx="2"/><rect x="268.1583557128906" y="1016.5333862304688" width="144.9824981689453" height="18.933334350585938" fill="black" rx="2"/><rect x="197.4666748046875" y="1057.4666748046875" width="285.0666809082031" height="22.13333511352539" fill="black" rx="2"/><rect x="282.4750061035156" y="1115.4666748046875" width="116.5281982421875" height="22.13333511352539" fill="black" rx="2"/><rect x="118.62500762939453" y="1136.533447265625" width="442.9208679199219" height="18.933334350585938" fill="black" rx="2"/><rect x="233.5083465576172" y="1153.533447265625" width="214.28250122070312" height="18.933334350585938" fill="black" rx="2"/><rect x="280.9750061035156" y="1221.4666748046875" width="119.53704833984375" height="22.13333511352539" fill="black" rx="2"/><rect x="105.30834197998047" y="1242.533447265625" width="470.68017578125" height="18.933334350585938" fill="black" rx="2"/><rect x="206.683349609375" y="1259.533447265625" width="266.8591003417969" height="18.933334350585938" fill="black" rx="2"/><rect x="258.4250183105469" y="1327.466796875" width="163.9770965576172" height="22.13333511352539" fill="black" rx="2"/><rect x="116.87500762939453" y="1348.533447265625" width="445.4875183105469" height="18.933334350585938" fill="black" rx="2"/><rect x="241.65000915527344" y="1365.533447265625" width="196.7178497314453" height="18.933334350585938" fill="black" rx="2"/><rect x="-4.019995117560029" y="98.53334045410156" width="62.24528121948242" height="18.933334350585938" fill="black" rx="2"/><rect x="-1.8699951171875" y="204.53334045410156" width="60.095951080322266" height="18.933334350585938" fill="black" rx="2"/><rect x="25.746673583984375" y="310.5333557128906" width="33.65131950378418" height="18.933334350585938" fill="black" rx="2"/><rect x="8.463338851928711" y="482.5333557128906" width="49.96198272705078" height="18.933334350585938" fill="black" rx="2"/><rect x="8.463338851928711" y="588.5333862304688" width="49.96198272705078" height="18.933334350585938" fill="black" rx="2"/><rect x="8.463338851928711" y="794.5333862304688" width="49.96198272705078" height="18.933334350585938" fill="black" rx="2"/><rect x="15.813339233398438" y="956.5333862304688" width="42.41730499267578" height="18.933334350585938" fill="black" rx="2"/><rect x="7.430005073547363" y="1128.533447265625" width="50.98930740356445" height="18.933334350585938" fill="black" rx="2"/><rect x="-4.019995117560029" y="1234.533447265625" width="62.24528121948242" height="18.933334350585938" fill="black" rx="2"/><rect x="-4.019995117560029" y="1340.533447265625" width="62.24528121948242" height="18.933334350585938" fill="black" rx="2"/><rect x="166.72500610351562" y="1436.533447265625" width="345.7916259765625" height="18.933334350585938" fill="black" rx="2"/></mask></defs>

  <!-- Legend -->
  <rect x="60" y="1424" width="560" height="40" rx="8" fill="none" stroke="#DEDCD1" stroke-width="0.5" stroke-dasharray="4 3" opacity="0.4"/>
  <text x="340" y="1446" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#C2C0B6" opacity="0.5">Zyn Protocol Technical Flowchart</text>
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
