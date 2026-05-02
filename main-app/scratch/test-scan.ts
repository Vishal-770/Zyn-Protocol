import path from 'path';

try {
  process.loadEnvFile(path.resolve(__dirname, '../.env.local'));
} catch (e) {}

async function main() {
  const { POST } = await import('../app/api/scan/route');
  console.log("=== Testing /api/scan ===");
  console.log("RPC URL:", process.env.NEXT_PUBLIC_SEPOLIA_RPC);

  // Mock a Next.js Request
  const req = new Request('http://localhost:3000/api/scan', {
    method: 'POST',
    body: JSON.stringify({}), // try without fromBlock
  });

  const res = await POST(req);
  const data = await res.json();
  
  if (!res.ok) {
    console.error("Error:", data);
  } else {
    console.log(`Success! Latest Block: ${data.latestBlock}`);
    console.log(`Found ${data.announcements.length} announcements.`);
    if (data.announcements.length > 0) {
      console.log("Latest announcement:", data.announcements[data.announcements.length - 1]);
    }
  }
}

main().catch(console.error);
