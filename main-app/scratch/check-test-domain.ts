import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { normalize } from 'viem/ens';

const rpcUrl = "https://sepolia.infura.io/v3/1e759bc0e2864f39ba3f1fcaa614073b";

const client = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

async function check() {
  const name = "test.zyn.eth";
  console.log(`Checking ${name}...`);
  try {
    const text = await client.getEnsText({
      name: normalize(name),
      key: "stealth-meta-address",
    });
    console.log(`Stealth Meta Address: ${text}`);
    
    const addr = await client.getEnsAddress({
      name: normalize(name),
    });
    console.log(`ENS Address (addr): ${addr}`);
    
  } catch (e) {
    console.error(e);
  }
}

check();
