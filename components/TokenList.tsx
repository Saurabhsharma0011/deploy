"use client";

import { useState } from 'react';
import { useTokens, useSearchTokens } from '@/hooks/useDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Calendar, User, Database } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TokenListProps {
  onTokenSelect?: (tokenMint: string) => void;
}

export const TokenList = ({ onTokenSelect }: TokenListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { tokens, loading, error, refetch } = useTokens(currentPage, 20);
  const { tokens: searchResults, loading: searchLoading, searchTokens } = useSearchTokens();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchTokens(query);
    }
  };

  const displayTokens = searchQuery.trim() ? searchResults : tokens;
  const isLoading = searchQuery.trim() ? searchLoading : loading;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <p className="text-red-600">Error loading tokens: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-transparent border border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Created Tokens Database
            <Badge variant="secondary" className="ml-auto">
              {displayTokens.length} tokens
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tokens by name or symbol..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Token Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-transparent border border-primary/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : displayTokens.length === 0 ? (
          <Card className="col-span-full bg-transparent border border-primary/30">
            <CardContent className="p-8 text-center">
              <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">
                {searchQuery.trim() ? 'No tokens found matching your search.' : 'No tokens created yet.'}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {searchQuery.trim() 
                  ? 'Try a different search term.' 
                  : 'Tokens created through this platform will appear here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          displayTokens.map((token) => (
            <Card 
              key={token.mint_address} 
              className="bg-transparent border border-primary/30 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onTokenSelect?.(token.mint_address)}
            >
              <CardContent className="p-4 space-y-3">
                {/* Token Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
                    {token.image_url ? (
                      <img 
                        src={token.image_url} 
                        alt={token.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.textContent = token.symbol.charAt(0);
                        }}
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {token.symbol.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{token.name}</h3>
                    <p className="text-xs text-muted-foreground">${token.symbol}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    New
                  </Badge>
                </div>

                {/* Description */}
                {token.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {token.description}
                  </p>
                )}

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Supply:</span>
                    <span className="font-medium">{token.initial_supply.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Mint:</span>
                    <span className="font-mono">{formatAddress(token.mint_address)}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(token.created_at!)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    {formatAddress(token.creator_address)}
                  </Badge>
                </div>

                {/* Social Links */}
                {(token.website || token.twitter || token.telegram) && (
                  <div className="flex gap-2 pt-2 border-t border-primary/20">
                    {token.website && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(token.website, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Website
                      </Button>
                    )}
                    {token.twitter && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(token.twitter, '_blank');
                        }}
                      >
                        X
                      </Button>
                    )}
                    {token.telegram && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(token.telegram, '_blank');
                        }}
                      >
                        TG
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!searchQuery.trim() && displayTokens.length >= 20 && (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={displayTokens.length < 20}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
