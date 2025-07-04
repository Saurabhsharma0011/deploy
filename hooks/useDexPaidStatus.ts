"use client"

import { useState, useEffect } from "react"

interface DexPaidStatus {
  isPaid: boolean
  isLoading: boolean
}

export const useDexPaidStatus = (mint: string, marketCapValue?: number): DexPaidStatus => {
  const [isPaid, setIsPaid] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      if (!mint) {
        setIsPaid(false)
        return
      }

      // Only check DEX paid status for tokens with market cap >= 10k (trending tokens)
      if (!marketCapValue || marketCapValue < 10000) {
        setIsPaid(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/proxy/dexscreener/${mint}`)
        if (response.ok) {
          const data = await response.json()
          
          // Handle the not_found case from our API route
          if (data.status === "not_found") {
            setIsPaid(false)
            return
          }
          
          // Check if we have a valid array response with approved status
          if (Array.isArray(data) && data.length > 0 && data[0].status === "approved") {
            setIsPaid(true)
          } else {
            setIsPaid(false)
          }
        } else {
          setIsPaid(false)
        }
      } catch (error) {
        console.error("Error fetching DEX paid status:", error)
        setIsPaid(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [mint, marketCapValue])

  return { isPaid, isLoading }
}