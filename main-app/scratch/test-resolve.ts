import path from 'path';

try {
  process.loadEnvFile(path.resolve(__dirname, '../.env.local'));
} catch (e) {}

import { GET } from '../app/api/resolve/route';
import { encodeFunctionData, toHex, stringToBytes } from 'viem';
import { CONTRACTS } from '../lib/contracts';

async function main() {
  console.log("=== Testing /api/resolve ===");

  // Mock CCIP-Read lookup
  // dns name = vishal.zyn.eth -> \x06vishal\x03zyn\x03eth\x00
  const dnsNameHex = toHex(
    new Uint8Array([...stringToBytes("\x06vishal\x03zyn\x03eth\x00")])
  );

  const queryDataHex = "0xdeadbeef";

  const data = encodeFunctionData({
    abi: CONTRACTS.STEALTH_RESOLVER.abi,
    functionName: 'resolve',
    args: [dnsNameHex, queryDataHex],
  });

  const req = new Request(`http://localhost:3000/api/resolve?sender=${CONTRACTS.STEALTH_RESOLVER.address}&data=${data}`);

  const res = await GET(req);
  const json = await res.json();
  
  if (!res.ok) {
    console.error("Error:", json);
  } else {
    console.log("Success! Response JSON:");
    console.log(json);
  }
}

main().catch(console.error);
