"use client"

import { Badge } from "@/components/ui/badge"
import { TokenData } from "@/hooks/useWebSocket"
import { useDexPaidStatus } from "@/hooks/useDexPaidStatus"
import { CheckCircle2 } from "lucide-react"

interface TrendingMarqueeProps {
  tokens: TokenData[]
  priceData: Record<string, any>
}

const MarqueeItem = ({ 
  token, 
  priceData 
}: { 
  token: TokenData
  priceData?: any
}) => {
  const { isPaid: isDexPaid } = useDexPaidStatus(token.mint, token.market_cap_value)

  const formatPrice = (price: number) => {
    if (price === 0) return "$0.00"
    if (price < 0.000001) return `$${price.toExponential(2)}`
    if (price < 0.01) return `$${price.toFixed(6)}`
    return `$${price.toFixed(4)}`
  }

  const formatMarketCap = (mcap: number) => {
    if (mcap >= 1000000) return `$${(mcap / 1000000).toFixed(1)}M`
    if (mcap >= 1000) return `$${(mcap / 1000).toFixed(1)}K`
    return `$${mcap.toFixed(0)}`
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-primary/5 border border-primary/20 rounded-xl mx-2 min-w-fit backdrop-blur-sm">
      {/* Token Image */}
      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-foreground font-semibold overflow-hidden flex-shrink-0">
        {token.image && token.image !== "/placeholder.svg?height=48&width=48" ? (
          <img
            src={token.image || "/placeholder.svg"}
            alt={token.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = "none"
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<span class="text-primary-foreground font-semibold text-sm">${getInitials(token.name)}</span>`
              }
            }}
          />
        ) : (
          <span className="text-primary-foreground font-semibold text-sm">{getInitials(token.name)}</span>
        )}
      </div>

      {/* Token Info */}
      <div className="flex items-center gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">{token.name}</span>
            <span className="text-muted-foreground text-xs">({token.symbol})</span>
            {isDexPaid && (
              <CheckCircle2 className="w-3 h-3 text-green-500" title="DEX Paid" />
            )}
          </div>
        </div>

        {/* Price */}
        <div className="text-right min-w-0">
          <div className="text-xs text-muted-foreground">Price</div>
          <div className="font-semibold text-foreground text-sm">
            {formatPrice(Number(priceData?.price || 0))}
          </div>
        </div>

        {/* Market Cap */}
        <div className="text-right min-w-0">
          <div className="text-xs text-muted-foreground">MCap</div>
          <div className="font-semibold text-foreground text-sm">
            {formatMarketCap(priceData?.marketCap || token.market_cap_value || 0)}
          </div>
        </div>
      </div>
    </div>
  )
}

export const TrendingMarquee = ({ tokens, priceData }: TrendingMarqueeProps) => {
  // Duplicate tokens for seamless scrolling
  const duplicatedTokens = [...tokens, ...tokens]

  if (tokens.length === 0) {
    return (
      <div className="w-full py-4 bg-primary/5 border-y border-primary/20">
        <div className="text-center text-muted-foreground text-sm">
          No trending tokens available
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-4 bg-primary/5 border-y border-primary/20 overflow-hidden">
      <div className="flex items-center mb-2 px-6">
        <Badge className="bg-primary text-primary-foreground text-xs">
          🔥 Trending Now
        </Badge>
      </div>
      
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {duplicatedTokens.map((token, index) => (
            <MarqueeItem
              key={`${token.mint}-${index}`}
              token={token}
              priceData={priceData[token.mint]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
