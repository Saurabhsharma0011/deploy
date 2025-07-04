import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if both URL and key are properly configured
const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                    supabaseAnonKey !== 'placeholder-key' &&
                    !supabaseUrl.includes('your_supabase') &&
                    !supabaseAnonKey.includes('your_supabase')

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

// TypeScript interface for our token data
export interface Token {
  id?: string
  mint_address: string
  name: string
  symbol: string
  description?: string
  image_url?: string
  metadata_uri?: string
  creator_address: string
  initial_supply: number
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
  created_at?: string
  updated_at?: string
}
