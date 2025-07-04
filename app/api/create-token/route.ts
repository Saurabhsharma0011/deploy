import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.publicKey) {
      return NextResponse.json(
        { error: 'publicKey is required' },
        { status: 400 }
      );
    }
    
    if (!body.tokenMetadata) {
      return NextResponse.json(
        { error: 'tokenMetadata is required' },
        { status: 400 }
      );
    }
    
    if (!body.mint) {
      return NextResponse.json(
        { error: 'mint is required' },
        { status: 400 }
      );
    }

    // Forward the request to pumpportal.fun API
    const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Add any additional headers if needed
      },
      body: JSON.stringify({
        publicKey: body.publicKey,
        action: "create",
        tokenMetadata: {
          name: body.tokenMetadata.name,
          symbol: body.tokenMetadata.symbol,
          uri: body.tokenMetadata.uri
        },
        mint: body.mint,
        denominatedInSol: body.denominatedInSol || "true",
        amount: body.amount || 1,
        slippage: body.slippage || 10,
        priorityFee: body.priorityFee || 0.0005,
        pool: body.pool || "pump"
      })
    });

    // If successful, return the transaction data
    if (response.ok) {
      const data = await response.arrayBuffer();
      
      // Save token to database after successful transaction creation
      try {
        await DatabaseService.createToken({
          mint_address: body.mint,
          name: body.tokenMetadata.name,
          symbol: body.tokenMetadata.symbol,
          description: body.tokenMetadata.description || '',
          image_url: body.tokenMetadata.image || '',
          metadata_uri: body.tokenMetadata.uri,
          creator_address: body.publicKey,
          initial_supply: body.amount || 1,
          website: body.tokenMetadata.website || '',
          twitter: body.tokenMetadata.twitter || '',
          telegram: body.tokenMetadata.telegram || '',
          discord: body.tokenMetadata.discord || ''
        });
        
        console.log('✅ Token saved to database successfully');
      } catch (dbError) {
        console.error('❌ Failed to save token to database:', dbError);
        // Continue anyway since the token creation was successful
      }
      
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
    } else {
      // Handle API error
      const errorText = await response.text();
      console.error('PumpPortal API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { error: errorText || response.statusText },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Create token API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
