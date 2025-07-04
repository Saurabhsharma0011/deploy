import { supabase, Token } from './supabase'

export class DatabaseService {
  // Create a new token in the database
  static async createToken(tokenData: Omit<Token, 'id' | 'created_at' | 'updated_at'>): Promise<Token | null> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .insert([tokenData])
        .select()
        .single()

      if (error) {
        console.error('Error creating token in database:', error)
        return null
      }

      console.log('Token successfully saved to database:', data)
      return data
    } catch (error) {
      console.error('Database error:', error)
      return null
    }
  }

  // Get token by mint address
  static async getTokenByMint(mintAddress: string): Promise<Token | null> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('mint_address', mintAddress)
        .single()

      if (error) {
        console.error('Error fetching token:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Database error:', error)
      return null
    }
  }

  // Get all tokens with pagination
  static async getTokens(page: number = 1, limit: number = 20): Promise<Token[]> {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Error fetching tokens:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Database error:', error)
      return []
    }
  }

  // Search tokens by name or symbol
  static async searchTokens(query: string): Promise<Token[]> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .or(`name.ilike.%${query}%,symbol.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error searching tokens:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Database error:', error)
      return []
    }
  }

  // Update token data
  static async updateToken(mintAddress: string, updates: Partial<Token>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tokens')
        .update(updates)
        .eq('mint_address', mintAddress)

      if (error) {
        console.error('Error updating token:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Database error:', error)
      return false
    }
  }
}
