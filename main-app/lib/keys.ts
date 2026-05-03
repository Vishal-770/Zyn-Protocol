import * as secp from '@noble/secp256k1';
import { bytesToHex, hexToBytes, keccak256 } from 'viem';

export const ENCRYPTION_MESSAGE =
  "Sign to access your StealthPay keys. This signature is used to " +
  "encrypt your keys locally. Never share this signature.";

/**
 * Generate a fresh pair of spending + viewing keypairs
 */
export function generateStealthKeypairs(): {
  spendingPrivKey: Uint8Array;
  spendingPubKey: Uint8Array;
  viewingPrivKey: Uint8Array;
  viewingPubKey: Uint8Array;
  stealthMetaAddress: string;
} {
  const spendingPrivKey = secp.utils.randomSecretKey();
  const viewingPrivKey = secp.utils.randomSecretKey();

  const spendingPubKey = secp.getPublicKey(spendingPrivKey, true);
  const viewingPubKey = secp.getPublicKey(viewingPrivKey, true);

  const stealthMetaAddress =
    "st:eth:0x" +
    bytesToHex(spendingPubKey).slice(2) +
    bytesToHex(viewingPubKey).slice(2);

  return {
    spendingPrivKey,
    spendingPubKey,
    viewingPrivKey,
    viewingPubKey,
    stealthMetaAddress,
  };
}

/**
 * Derive the public Stealth Meta-Address from private keys
 */
export function computeStealthMetaAddress(
  spendingPrivKey: Uint8Array,
  viewingPrivKey: Uint8Array
): string {
  const spendingPubKey = secp.getPublicKey(spendingPrivKey, true);
  const viewingPubKey = secp.getPublicKey(viewingPrivKey, true);

  return (
    "st:eth:0x" +
    bytesToHex(spendingPubKey).slice(2) +
    bytesToHex(viewingPubKey).slice(2)
  );
}

/**
 * Derive an AES-GCM encryption key from a wallet signature using Web Crypto API.
 */
async function deriveEncryptionKey(signature: string): Promise<CryptoKey> {
  // Hash the signature to get a 32-byte uniform key
  const hash = keccak256(hexToBytes(signature as `0x${string}`));
  const keyMaterial = hexToBytes(hash);

  return await window.crypto.subtle.importKey(
    "raw",
    new Uint8Array(keyMaterial),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Utility: Convert ArrayBuffer or Uint8Array to Base64
 */
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Utility: Convert Base64 to ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt and save keys to localStorage
 */
export async function saveKeys(
  walletAddress: string,
  chainId: number,
  signature: string,
  spendingPrivKey: Uint8Array,
  viewingPrivKey: Uint8Array
): Promise<void> {
  const payload = JSON.stringify({
    spendingPrivKey: bytesToHex(spendingPrivKey),
    viewingPrivKey: bytesToHex(viewingPrivKey),
  });

  const cryptoKey = await deriveEncryptionKey(signature);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedPayload = new TextEncoder().encode(payload);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encodedPayload
  );

  const storedData = {
    iv: bufferToBase64(iv),
    data: bufferToBase64(ciphertext),
  };

  localStorage.setItem(
    `stealthpay_keys_${chainId}_${walletAddress.toLowerCase()}`,
    JSON.stringify(storedData)
  );
}

/**
 * Load and decrypt keys from localStorage
 */
export async function loadKeys(
  walletAddress: string,
  chainId: number,
  signature: string
): Promise<{
  spendingPrivKey: Uint8Array;
  viewingPrivKey: Uint8Array;
} | null> {
  const item = localStorage.getItem(`stealthpay_keys_${chainId}_${walletAddress.toLowerCase()}`);
  if (!item) return null;

  try {
    const storedData = JSON.parse(item);
    const iv = base64ToBuffer(storedData.iv);
    const ciphertext = base64ToBuffer(storedData.data);

    const cryptoKey = await deriveEncryptionKey(signature);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv) },
      cryptoKey,
      ciphertext
    );

    const payload = new TextDecoder().decode(decrypted);
    const { spendingPrivKey, viewingPrivKey } = JSON.parse(payload);

    return {
      spendingPrivKey: hexToBytes(spendingPrivKey),
      viewingPrivKey: hexToBytes(viewingPrivKey),
    };
  } catch (error) {
    console.error("Failed to decrypt stealth keys", error);
    return null;
  }
}

/**
 * Check if keys exist in localStorage for this wallet
 */
export function hasKeys(walletAddress: string, chainId: number): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(`stealthpay_keys_${chainId}_${walletAddress.toLowerCase()}`);
}
