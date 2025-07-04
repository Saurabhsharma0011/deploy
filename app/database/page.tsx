"use client";

import { TokenList } from '@/components/TokenList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DatabaseTokensPage() {
  const handleTokenSelect = (tokenMint: string) => {
    console.log('Selected token:', tokenMint);
    // You can add navigation to token detail page here
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30 px-6 py-4 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Database Tokens</h1>
            </div>
          </div>
          
          <Link href="/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Token
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Info Card */}
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Token Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This page displays all tokens that have been created through this platform and saved to our database. 
                Every successful token creation is automatically stored here with complete metadata.
              </p>
            </CardContent>
          </Card>

          {/* Token List */}
          <TokenList onTokenSelect={handleTokenSelect} />
        </div>
      </main>
    </div>
  );
}
