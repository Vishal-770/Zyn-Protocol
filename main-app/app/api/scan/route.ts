import { NextResponse } from 'next/server';
import { publicClient } from '../../../lib/ens';
import { CONTRACTS } from '../../../lib/contracts';
import { parseEventLogs, parseAbiItem } from 'viem';

const DEPLOYMENT_BLOCK = BigInt(10770000); // Current Sepolia deployment block
const CHUNK_SIZE = BigInt(10000); // 10,000 blocks per request is safe for Alchemy

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const latestBlock = await publicClient.getBlockNumber();
    
    let fromBlock: bigint;
    if (body.fromBlock === 0 || body.fromBlock === "0") {
      fromBlock = DEPLOYMENT_BLOCK;
    } else if (body.fromBlock) {
      fromBlock = BigInt(body.fromBlock);
    } else {
      // Default to scanning from deployment block if no preference
      fromBlock = DEPLOYMENT_BLOCK;
    }

    if (fromBlock < DEPLOYMENT_BLOCK) fromBlock = DEPLOYMENT_BLOCK;

    console.log(`Scanning from block ${fromBlock} to ${latestBlock}...`);

    let allLogs: any[] = [];
    let currentFromBlock = fromBlock;

    while (currentFromBlock <= latestBlock) {
      const toBlock = currentFromBlock + CHUNK_SIZE > latestBlock ? latestBlock : currentFromBlock + CHUNK_SIZE;
      
      const logs = await publicClient.getLogs({
        address: CONTRACTS.EPHEMERAL_ANNOUNCER.address,
        event: parseAbiItem('event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)'),
        fromBlock: currentFromBlock,
        toBlock: toBlock,
      });
      
      allLogs.push(...logs);
      currentFromBlock = toBlock + BigInt(1);
    }

    console.log(`Found ${allLogs.length} raw announcement logs.`);

    const parsedLogs = parseEventLogs({
      abi: CONTRACTS.EPHEMERAL_ANNOUNCER.abi,
      logs: allLogs,
      eventName: 'Announcement',
    });

    const announcements = parsedLogs.map((log: any) => {
      const metadataHex = log.args.metadata as string;
      // View tag is the first byte after 0x
      const viewTag = metadataHex && metadataHex.length >= 4 
        ? parseInt(metadataHex.slice(2, 4), 16) 
        : 0;

      return {
        stealthAddress: log.args.stealthAddress,
        ephemeralPubKey: log.args.ephemeralPubKey,
        caller: log.args.caller,
        viewTag,
        schemeId: Number(log.args.schemeId),
        blockNumber: Number(log.blockNumber),
        transactionHash: log.transactionHash,
      };
    });

    return NextResponse.json({
      announcements,
      latestBlock: Number(latestBlock),
    });

  } catch (error: any) {
    console.error("Scan API Error:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
