import { NextResponse } from 'next/server';
import { publicClient } from '../../../lib/ens';
import { CONTRACTS } from '../../../lib/contracts';
import { parseEventLogs, parseAbiItem } from 'viem';

const DEPLOYMENT_BLOCK = BigInt(10770000); 
const CHUNK_SIZE = BigInt(10000); 

const SUBGRAPH_URL = process.env.SUBGRAPH_URL || process.env.NEXT_PUBLIC_SUBGRAPH_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const latestBlock = await publicClient.getBlockNumber();
    
    // If subgraph is configured, use it for lightning fast retrieval
    if (SUBGRAPH_URL) {
      console.log("Querying subgraph for announcements...");
      const query = `
        {
          announcements(first: 1000, orderBy: blockNumber, orderDirection: desc) {
            id
            schemeId
            stealthAddress
            caller
            ephemeralPubKey
            metadata
            viewTag
            blockNumber
            transactionHash
          }
        }
      `;

      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const { data } = await response.json();
      
      if (data && data.announcements) {
        const announcements = data.announcements.map((a: any) => ({
          stealthAddress: a.stealthAddress,
          ephemeralPubKey: a.ephemeralPubKey,
          caller: a.caller,
          viewTag: a.viewTag,
          schemeId: Number(a.schemeId),
          blockNumber: Number(a.blockNumber),
          transactionHash: a.transactionHash,
        }));

        return NextResponse.json({
          announcements,
          latestBlock: Number(latestBlock),
          indexed: true
        });
      }
    }

    // FALLBACK: Manual scan (original logic)
    console.warn("Subgraph URL not found or query failed. Falling back to manual block scanning...");
    
    let fromBlock: bigint;
    if (body.fromBlock === 0 || body.fromBlock === "0") {
      fromBlock = DEPLOYMENT_BLOCK;
    } else if (body.fromBlock) {
      fromBlock = BigInt(body.fromBlock);
    } else {
      fromBlock = DEPLOYMENT_BLOCK;
    }

    if (fromBlock < DEPLOYMENT_BLOCK) fromBlock = DEPLOYMENT_BLOCK;

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

    const parsedLogs = parseEventLogs({
      abi: CONTRACTS.EPHEMERAL_ANNOUNCER.abi,
      logs: allLogs,
      eventName: 'Announcement',
    });

    const announcements = parsedLogs.map((log: any) => {
      const metadataHex = log.args.metadata as string;
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
      indexed: false
    });

  } catch (error: any) {
    console.error("Scan API Error:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
