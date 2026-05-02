import { NextResponse } from 'next/server';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { CONTRACTS } from '@/lib/contracts';

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;

export async function POST(req: Request) {
  try {
    const { schemeId, stealthAddress, ephemeralPubKey, viewTag, signature } = await req.json();

    if (!RELAYER_PRIVATE_KEY) {
      return NextResponse.json({ error: 'Relayer not configured' }, { status: 500 });
    }

    const account = privateKeyToAccount(RELAYER_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC)
    });

    console.log(`Relaying announcement for ${stealthAddress}...`);

    const hash = await walletClient.writeContract({
      address: CONTRACTS.EPHEMERAL_ANNOUNCER.address,
      abi: CONTRACTS.EPHEMERAL_ANNOUNCER.abi,
      functionName: 'announce',
      args: [
        BigInt(schemeId),
        stealthAddress as `0x${string}`,
        ephemeralPubKey as `0x${string}`,
        `0x${viewTag.toString(16).padStart(2, '0')}` as `0x${string}`
      ],
    });

    return NextResponse.json({ hash });
  } catch (error: any) {
    console.error('Relay Error:', error);
    return NextResponse.json({ error: error.message || 'Relay failed' }, { status: 400 });
  }
}
