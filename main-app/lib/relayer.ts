import { bytesToHex, keccak256, encodePacked } from 'viem';

/**
 * Sign an announcement payload for the relayer.
 * This allows the sender to authorize the relayer to post the "clue" on-chain,
 * maintaining the sender's privacy.
 */
export async function signAnnouncePayload(
  schemeId: bigint,
  stealthAddress: string,
  ephemeralPubKey: string,
  viewTag: number,
  signMessageAsync: (params: { message: { raw: `0x${string}` } | string }) => Promise<string>
) {
  // Metadata contains the viewTag (first byte)
  const metadata = bytesToHex(new Uint8Array([viewTag]));
  
  // Hash the payload exactly as the EphemeralAnnouncer.announceFor contract function expects
  const payloadHash = keccak256(
    encodePacked(
      ['uint256', 'address', 'bytes', 'bytes'],
      [schemeId, stealthAddress as `0x${string}`, ephemeralPubKey as `0x${string}`, metadata as `0x${string}`]
    )
  );

  // Sign the raw hash (standard personal_sign)
  const signature = await signMessageAsync({
    message: { raw: payloadHash }
  });

  return signature;
}
