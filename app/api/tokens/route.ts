import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const mint = searchParams.get('mint')

    let tokens

    if (mint) {
      // Get specific token by mint address
      const token = await DatabaseService.getTokenByMint(mint)
      tokens = token ? [token] : []
    } else if (search) {
      // Search tokens
      tokens = await DatabaseService.searchTokens(search)
    } else {
      // Get paginated tokens
      tokens = await DatabaseService.getTokens(page, limit)
    }

    return NextResponse.json({
      success: true,
      data: tokens,
      pagination: {
        page,
        limit,
        total: tokens.length
      }
    })

  } catch (error) {
    console.error('Get tokens API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { mint_address, ...updates } = body

    if (!mint_address) {
      return NextResponse.json(
        { error: 'mint_address is required' },
        { status: 400 }
      )
    }

    const success = await DatabaseService.updateToken(mint_address, updates)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to update token' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Update token API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
