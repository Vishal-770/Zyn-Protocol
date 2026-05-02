import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

// ENS Sepolia Addresses
const ENS_REGISTRY_SEPOLIA = "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e";
const PUBLIC_RESOLVER_SEPOLIA = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD"; 
const PARENT_DOMAIN = "zyn.eth"; // The domain on Sepolia

async function main() {
  const [deployer] = await ethers.getSigners();
  const parentNode = ethers.namehash(PARENT_DOMAIN);

  console.log("\n========================================================");
  console.log("🚀 Starting Zyn StealthPay Deployment (Zero-Link)");
  console.log("========================================================\n");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Parent Domain: ${PARENT_DOMAIN}`);
  console.log(`Parent Node: ${parentNode}\n`);

  // --- STEP 1: Deploy EphemeralAnnouncer ---
  console.log("📦 [1/3] Deploying EphemeralAnnouncer...");
  const AnnouncerFactory = await ethers.getContractFactory("EphemeralAnnouncer");
  const announcer = await AnnouncerFactory.deploy();
  await announcer.waitForDeployment();
  const announcerAddress = await announcer.getAddress();
  console.log(`✅ EphemeralAnnouncer: ${announcerAddress}\n`);

  // --- STEP 2: Deploy StealthResolver ---
  console.log("📦 [2/3] Deploying StealthResolver...");
  // Gateway URL - replace with your actual domain later if needed
  const gatewayUrl = "http://localhost:3000/api/resolve?sender={sender}&data={data}";
  const StealthResolverFactory = await ethers.getContractFactory("StealthResolver");
  // Using deployer as the default signer for CCIP-Read
  const stealthResolver = await StealthResolverFactory.deploy(gatewayUrl, deployer.address);
  await stealthResolver.waitForDeployment();
  const stealthResolverAddress = await stealthResolver.getAddress();
  console.log(`✅ StealthResolver: ${stealthResolverAddress}\n`);

  // --- STEP 3: Deploy SubdomainRegistrar ---
  console.log("📦 [3/3] Deploying SubdomainRegistrar...");
  const RegistrarFactory = await ethers.getContractFactory("SubdomainRegistrar");
  const registrar = await RegistrarFactory.deploy(
    ENS_REGISTRY_SEPOLIA,
    parentNode,
    PUBLIC_RESOLVER_SEPOLIA,
    stealthResolverAddress
  );
  await registrar.waitForDeployment();
  const registrarAddress = await registrar.getAddress();
  console.log(`✅ SubdomainRegistrar: ${registrarAddress}\n`);

  // --- UPDATE ENVIRONMENT ---
  console.log("📝 Updating .env.local for main-app...");
  const envPath = path.join(__dirname, "../../main-app/.env.local");
  const envContent = `
NEXT_PUBLIC_EPHEMERAL_ANNOUNCER_ADDRESS=${announcerAddress}
NEXT_PUBLIC_STEALTH_RESOLVER_ADDRESS=${stealthResolverAddress}
NEXT_PUBLIC_SUBDOMAIN_REGISTRAR_ADDRESS=${registrarAddress}
NEXT_PUBLIC_PARENT_DOMAIN=${PARENT_DOMAIN}
NEXT_PUBLIC_SEPOLIA_RPC=${process.env.SEPOLIA_RPC || ""}
`.trim();

  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Environment file updated at: ${envPath}\n`);

  console.log("========================================================");
  console.log("🏁 DEPLOYMENT COMPLETE");
  console.log("========================================================\n");
  console.log("⚠️  FINAL MANUAL STEPS REQUIRED:");
  console.log("1. Go to https://app.ens.domains");
  console.log(`2. Search for '${PARENT_DOMAIN}'`);
  console.log("3. Go to 'Permissions' (Controller) tab");
  console.log(`4. Add this address as a Controller: ${registrarAddress}`);
  console.log("5. Go to 'Resolver' tab");
  console.log(`6. Ensure the resolver is NOT our StealthResolver for the parent itself.`);
  console.log("   (The Registrar will handle setting the resolver for subdomains automatically.)");
  console.log("\n========================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
