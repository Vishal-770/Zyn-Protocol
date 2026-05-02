import { generateStealthKeypairs } from "../lib/keys";
import {
  parseStealthMetaAddress,
  generateStealthAddress,
  checkStealthAddress,
  computeStealthPrivKey
} from "../lib/stealth";
import { bytesToHex, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

async function main() {
  console.log("=== STEALTH CRYPTO TEST ===");

  // 1. Generate keys (Registration Phase)
  console.log("\n[Registration]");
  const keys = generateStealthKeypairs();
  console.log("Stealth Meta Address:", keys.stealthMetaAddress);

  // 2. Parse meta address
  console.log("\n[Parsing]");
  const parsed = parseStealthMetaAddress(keys.stealthMetaAddress);
  console.log("Spending Pub Key:", bytesToHex(parsed.spendingPubKey));
  console.log("Viewing Pub Key: ", bytesToHex(parsed.viewingPubKey));

  // 3. Sender generates a stealth address to send funds to
  console.log("\n[Sender Flow]");
  const senderData = generateStealthAddress(keys.stealthMetaAddress);
  console.log("Generated Stealth Address to fund:", senderData.stealthAddress);
  console.log("Ephemeral Pub Key to announce:  ", bytesToHex(senderData.ephemeralPubKey));
  console.log("View Tag (first byte of secret):", senderData.viewTag);

  // 4. Receiver scans the announcement
  console.log("\n[Receiver Scanning Flow]");
  const scanResult = checkStealthAddress({
    ephemeralPubKey: senderData.ephemeralPubKey,
    viewingPrivKey: keys.viewingPrivKey,
    spendingPubKey: parsed.spendingPubKey,
    viewTag: senderData.viewTag,
  });
  
  console.log("Is this payment for me?", scanResult.isForMe);
  if (!scanResult.isForMe) {
    console.error("FAIL: Scan did not match!");
    process.exit(1);
  }
  console.log("Re-derived Stealth Address:     ", scanResult.stealthAddress);
  
  if (scanResult.stealthAddress !== senderData.stealthAddress) {
    console.error("FAIL: Re-derived address does not match sender's address!");
    process.exit(1);
  } else {
    console.log("SUCCESS: Addresses match precisely.");
  }

  // 5. Receiver sweeps the funds
  console.log("\n[Receiver Sweeping Flow]");
  const stealthPrivKey = computeStealthPrivKey(keys.spendingPrivKey, scanResult.hashedSecret!);
  console.log("Derived Stealth Private Key:    ", bytesToHex(stealthPrivKey));

  // Verify the derived private key actually controls the stealth address
  const account = privateKeyToAccount(bytesToHex(stealthPrivKey) as `0x${string}`);
  console.log("Address derived from Priv Key:  ", account.address);

  if (account.address.toLowerCase() !== senderData.stealthAddress.toLowerCase()) {
    console.error("FAIL: The private key does not control the stealth address!");
    process.exit(1);
  } else {
    console.log("SUCCESS: Private key math verified. Full flow working perfectly.");
  }
}

main().catch(console.error);
