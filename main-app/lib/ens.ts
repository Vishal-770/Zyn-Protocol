import { createPublicClient, http, namehash, Address } from 'viem';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';
import { CONTRACTS } from './contracts';

const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://rpc2.sepolia.org";
const PARENT_DOMAIN = process.env.NEXT_PUBLIC_PARENT_DOMAIN || "zyn.eth";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

/**
 * Normalizes a name and ensures it ends with the parent domain.
 */
export function formatName(name: string): string {
  try {
    if (!name || name.length < 3) return "";
    
    const lower = name.toLowerCase().trim();
    const label = lower.split('.')[0];
    
    return normalize(`${label}.${PARENT_DOMAIN}`);
  } catch (e) {
    return "";
  }
}

/**
 * Check if a subdomain name is available via our Registrar contract.
 */
export async function isSubdomainAvailable(name: string): Promise<boolean> {
  try {
    const label = name.split('.')[0];
    const available = await publicClient.readContract({
      address: CONTRACTS.SUBDOMAIN_REGISTRAR.address,
      abi: CONTRACTS.SUBDOMAIN_REGISTRAR.abi,
      functionName: 'isAvailable',
      args: [label],
    });

    return !!available;
  } catch (error) {
    console.error("Error checking subdomain availability:", error);
    return false;
  }
}

/**
 * Read the 'stealth' text record from the Official Public Resolver.
 */
export async function getStealthMetaAddress(name: string): Promise<string | null> {
  try {
    const normalized = normalize(name);
    const node = namehash(normalized);
    
    const meta = await publicClient.readContract({
      address: "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD", // Correct Sepolia Public Resolver
      abi: [{
        "inputs": [
          { "internalType": "bytes32", "name": "node", "type": "bytes32" },
          { "internalType": "string", "name": "key", "type": "string" }
        ],
        "name": "text",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
      }],
      functionName: 'text',
      args: [node, 'stealth'],
    }) as string;

    return meta || null;
  } catch (error) {
    console.error("Error fetching stealth text record:", error);
    return null;
  }
}

/**
 * Perform LOCAL stealth address generation for a recipient.
 */
export async function resolveToStealthData(name: string) {
  const metaAddress = await getStealthMetaAddress(name);
  if (!metaAddress) return null;

  try {
    const { generateStealthAddress } = await import('./stealth');
    const data = generateStealthAddress(metaAddress);
    return {
      address: data.stealthAddress,
      ephemeralPubKey: data.ephemeralPubKey,
      viewTag: data.viewTag
    };
  } catch (e) {
    console.error("Local stealth generation failed:", e);
    return null;
  }
}

/**
 * Resolves an ENS name to an address.
 * Since our resolver uses CCIP-Read, viem's getEnsAddress will automatically
 * handle the redirection to our API gateway.
 */
export async function resolveEnsName(name: string): Promise<Address | null> {
  try {
    const normalized = normalize(name);
    const address = await publicClient.getEnsAddress({
      name: normalized,
    });
    return address || null;
  } catch (error) {
    console.error("Error resolving ENS name:", error);
    return null;
  }
}
