import { ethers } from "hardhat";

async function main() {
  const RESOLVER_ADDRESS = "0xb212019738a34EaA22f43042186a287C23CDcF68";
  const NEW_URL = "https://zyn-protocol.vercel.app/api/resolve"; // Standardizing to /api/resolve

  console.log(`Updating StealthResolver at ${RESOLVER_ADDRESS}...`);
  console.log(`New Gateway URL: ${NEW_URL}`);

  const StealthResolver = await ethers.getContractAt("StealthResolver", RESOLVER_ADDRESS);
  
  const tx = await StealthResolver.setUrl(NEW_URL);
  console.log(`Transaction sent: ${tx.hash}`);

  await tx.wait();
  console.log("Successfully updated gateway URL.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
