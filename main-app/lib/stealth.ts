import * as secp from '@noble/secp256k1';
import { bytesToHex, hexToBytes, keccak256 } from 'viem';
import { publicKeyToAddress } from 'viem/accounts';

// Ensure standard secp256k1 curve parameters
const G = secp.Point.BASE;
const CURVE_ORDER = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");

/**
 * Parses a stealth meta-address string into its component public keys.
 * Format: "st:eth:0x" + hex(spendingPubKey) + hex(viewingPubKey)
 */
export function parseStealthMetaAddress(stealthMetaAddress: string): {
  spendingPubKey: Uint8Array;
  viewingPubKey: Uint8Array;
} {
  if (!stealthMetaAddress.startsWith("st:eth:0x")) {
    throw new Error("Invalid stealth meta-address format");
  }

  const hexKeys = stealthMetaAddress.replace("st:eth:0x", "");
  if (hexKeys.length !== 132) { // 66 chars each (33 bytes * 2)
    throw new Error("Invalid stealth meta-address length");
  }

  const spendingPubKeyHex = hexKeys.slice(0, 66);
  const viewingPubKeyHex = hexKeys.slice(66, 132);

  return {
    spendingPubKey: hexToBytes(`0x${spendingPubKeyHex}`),
    viewingPubKey: hexToBytes(`0x${viewingPubKeyHex}`),
  };
}

/**
 * Generates a fresh one-time stealth address for a given recipient.
 * Used by the sender (or the CCIP-Read gateway) to create the address to send funds to.
 */
export function generateStealthAddress(stealthMetaAddress: string): {
  stealthAddress: string;
  ephemeralPubKey: Uint8Array;
  viewTag: number;
} {
  const { spendingPubKey, viewingPubKey } = parseStealthMetaAddress(stealthMetaAddress);

  // 1. Generate ephemeral keypair
  const ephemeralPrivKey = secp.utils.randomSecretKey();
  const ephemeralPubKey = secp.getPublicKey(ephemeralPrivKey, true);

  // 2. Compute shared secret (ECDH)
  const sharedSecret = secp.getSharedSecret(ephemeralPrivKey, viewingPubKey, true);

  // 3. Hash the shared secret (SLICE TO 32 BYTES per EIP-5564)
  const hashedSecretHex = keccak256(sharedSecret.slice(1, 33));
  const hashedSecret = hexToBytes(hashedSecretHex);

  // 4. Extract view tag (first byte)
  const viewTag = hashedSecret[0];

  // 5. Compute stealth public key: stealthPubKey = spendingPubKey + hashedSecret * G
  const spendingPoint = secp.Point.fromHex(bytesToHex(spendingPubKey).slice(2));
  const hashedSecretScalar = BigInt(`0x${bytesToHex(hashedSecret).slice(2)}`) % CURVE_ORDER;
  const sharedSecretPoint = G.multiply(hashedSecretScalar);
  const stealthPubPoint = spendingPoint.add(sharedSecretPoint);

  // 6. Derive stealth address (using viem's publicKeyToAddress on uncompressed 65-byte key)
  const stealthPubKeyUncompressed = stealthPubPoint.toBytes(false);
  const stealthAddress = publicKeyToAddress(bytesToHex(stealthPubKeyUncompressed));

  return {
    stealthAddress,
    ephemeralPubKey,
    viewTag,
  };
}

/**
 * Checks if an on-chain announcement belongs to the current user.
 * Runs ENTIRELY IN THE BROWSER.
 */
export function checkStealthAddress(params: {
  ephemeralPubKey: Uint8Array;
  viewingPrivKey: Uint8Array;
  spendingPubKey: Uint8Array;
  viewTag?: number;
}): {
  isForMe: boolean;
  stealthAddress?: string;
  hashedSecret?: Uint8Array;
} {
  try {
    // 1. Compute shared secret (ECDH)
    const sharedSecret = secp.getSharedSecret(params.viewingPrivKey, params.ephemeralPubKey, true);

    // 2. Hash the shared secret (SLICE TO 32 BYTES per EIP-5564)
    const hashedSecretHex = keccak256(sharedSecret.slice(1, 33));
    const hashedSecret = hexToBytes(hashedSecretHex);

    // 3. Quick check with view tag (saves computing full address if mismatch)
    if (params.viewTag !== undefined && hashedSecret[0] !== params.viewTag) {
      return { isForMe: false };
    }

    // 4. Recompute stealth address
    const spendingPoint = secp.Point.fromHex(bytesToHex(params.spendingPubKey).slice(2));
    const hashedSecretScalar = BigInt(`0x${bytesToHex(hashedSecret).slice(2)}`) % CURVE_ORDER;
    const sharedSecretPoint = G.multiply(hashedSecretScalar);
    const stealthPubPoint = spendingPoint.add(sharedSecretPoint);

    const stealthPubKeyUncompressed = stealthPubPoint.toBytes(false);
    const stealthAddress = publicKeyToAddress(bytesToHex(stealthPubKeyUncompressed));

    return {
      isForMe: true,
      stealthAddress,
      hashedSecret,
    };
  } catch (error) {
    // Catch invalid points or math errors gracefully
    return { isForMe: false };
  }
}

/**
 * Computes the private key for a stealth address (for sweeping).
 * stealthPrivKey = (spendingPrivKey + hashedSecret) mod curve_order
 */
export function computeStealthPrivKey(
  spendingPrivKey: Uint8Array,
  hashedSecret: Uint8Array
): Uint8Array {
  const spendingScalar = BigInt(`0x${bytesToHex(spendingPrivKey).slice(2)}`);
  const hashedSecretScalar = BigInt(`0x${bytesToHex(hashedSecret).slice(2)}`);

  // Modular addition on secp256k1
  const stealthPrivScalar = (spendingScalar + hashedSecretScalar) % CURVE_ORDER;

  // Convert BigInt back to 32-byte array
  let hex = stealthPrivScalar.toString(16);
  if (hex.length % 2 !== 0) hex = "0" + hex;
  // Pad to 32 bytes (64 hex chars)
  hex = hex.padStart(64, '0');
  
  return hexToBytes(`0x${hex}`);
}
