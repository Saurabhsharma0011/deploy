import { useState, useEffect } from 'react'
import { Token } from '@/lib/supabase'

export function useTokens(page: number = 1, limit: number = 20) {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/tokens?page=${page}&limit=${limit}`)
        const data = await response.json()
        
        if (data.success) {
          setTokens(data.data)
        } else {
          setError('Failed to fetch tokens')
        }
      } catch (err) {
        setError('Error fetching tokens')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [page, limit])

  const refetch = async () => {
    setLoading(true)
    const response = await fetch(`/api/tokens?page=${page}&limit=${limit}`)
    const data = await response.json()
    if (data.success) {
      setTokens(data.data)
    }
    setLoading(false)
  }

  return { tokens, loading, error, refetch }
}

export function useToken(mintAddress: string) {
  const [token, setToken] = useState<Token | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mintAddress) return

    const fetchToken = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/tokens?mint=${mintAddress}`)
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          setToken(data.data[0])
        } else {
          setError('Token not found')
        }
      } catch (err) {
        setError('Error fetching token')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [mintAddress])

  return { token, loading, error }
}

export function useSearchTokens() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchTokens = async (query: string) => {
    if (!query.trim()) {
      setTokens([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/tokens?search=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.success) {
        setTokens(data.data)
      } else {
        setError('Failed to search tokens')
        setTokens([])
      }
    } catch (err) {
      setError('Error searching tokens')
      setTokens([])
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { tokens, loading, error, searchTokens }
}
