import { NextResponse } from 'next/server';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL;

export async function POST(req: Request) {
  try {
    const { stealthMetaAddress } = await req.json();

    if (!SUBGRAPH_URL) {
      return NextResponse.json({ error: 'Subgraph not configured' }, { status: 500 });
    }

    if (!stealthMetaAddress) {
      return NextResponse.json({ error: 'Missing stealthMetaAddress' }, { status: 400 });
    }

    const query = `
      query getRegistrations($metaAddress: String!) {
        registrations(where: { stealthMetaAddress: $metaAddress }, orderBy: blockNumber, orderDirection: desc) {
          id
          label
          blockNumber
          blockTimestamp
          transactionHash
        }
      }
    `;

    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query,
        variables: { metaAddress: stealthMetaAddress }
      }),
    });

    const { data, errors } = await response.json();

    if (errors) {
      return NextResponse.json({ error: errors[0].message }, { status: 400 });
    }

    return NextResponse.json({
      registrations: data.registrations || [],
    });

  } catch (error: any) {
    console.error("Identities API Error:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
