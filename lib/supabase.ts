import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
