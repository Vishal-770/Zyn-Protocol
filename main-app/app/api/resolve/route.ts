import { NextRequest, NextResponse } from 'next/server';
import { 
  createPublicClient, 
  http, 
  decodeFunctionData, 
  encodeAbiParameters, 
  keccak256, 
  encodePacked, 
  toBytes, 
  encodeFunctionResult,
  Address
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { generateStealthAddress } from '@/lib/stealth';

const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC!;
const PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;
const RESOLVER_ADDRESS = process.env.NEXT_PUBLIC_STEALTH_RESOLVER_ADDRESS as Address;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

/**
 * CCIP-Read Gateway for Zyn StealthPay.
 * Responds to EIP-3668 OffchainLookup requests.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sender = searchParams.get('sender');
  const data = searchParams.get('data') as `0x${string}`;

  if (!sender || !data) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // 1. Decode the ENS call (e.g. addr(bytes32))
    // The first 4 bytes are the selector. 0x3b3b57de is addr(bytes32).
    const node = `0x${data.slice(10, 74)}` as `0x${string}`; // Extract the 32-byte node hash

    // 2. Fetch the 'stealth' text record from the Official ENS Resolver
    // We read directly using the node hash since we don't have the original name string here.
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

    if (!meta || meta === "") {
      return NextResponse.json({ error: 'No stealth record found' }, { status: 404 });
    }

    // 3. Generate the one-time stealth address
    const { stealthAddress } = generateStealthAddress(meta);

    // 4. Format the result as standard ENS resolution output (ABI-encoded address)
    const result = encodeAbiParameters(
      [{ type: 'address' }],
      [stealthAddress as Address]
    );

    // 5. Sign the response (CCIP-Read standard)
    const expires = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour
    const extraData = `0x${data.slice(74)}` || "0x"; 

    // Construct the message to sign (matching the StealthResolver contract)
    // EIP-191 style packing
    const messageHash = keccak256(
      encodePacked(
        ["bytes2", "address", "uint64", "bytes32", "bytes32"],
        ["0x1900", RESOLVER_ADDRESS, expires, keccak256(extraData as `0x${string}`), keccak256(result)]
      )
    );

    const account = privateKeyToAccount(PRIVATE_KEY);
    const signature = await account.signMessage({
      message: { raw: toBytes(messageHash) }
    });

    // 6. Encode the final response
    const response = encodeAbiParameters(
      [{ type: 'bytes' }, { type: 'uint64' }, { type: 'bytes' }],
      [result, expires, signature]
    );

    return NextResponse.json({ data: response });

  } catch (error: any) {
    console.error('CCIP-Read resolution error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
