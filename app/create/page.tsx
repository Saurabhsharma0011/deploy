"use client";

import { TokenCreate } from "@/components/TokenCreate";
import { useState } from "react";
import { CheckCircle, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function CreateTokenPage() {
  const [createdToken, setCreatedToken] = useState<any>(null);

  const handleTokenCreated = (tokenData: any) => {
    setCreatedToken(tokenData);
    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="border-b border-primary/30 px-6 py-4 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="bg-transparent border-border text-foreground hover:bg-secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Platform
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Create New Token</h1>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Success Message */}
        {createdToken && (
          <div className="mb-8">
            <Alert className="border-green-500 bg-green-500/10 max-w-2xl mx-auto">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-600">
                <div className="space-y-2">
                  <p className="font-semibold text-lg">Token Created Successfully! 🎉</p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {createdToken.name}</p>
                    <p><span className="font-medium">Symbol:</span> {createdToken.symbol}</p>
                    <p><span className="font-medium">Mint Address:</span> 
                      <span className="font-mono ml-1 block sm:inline mt-1 sm:mt-0">
                        {createdToken.mint}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://solscan.io/tx/${createdToken.signature}`, '_blank')}
                        className="text-green-600 border-green-600 hover:bg-green-600/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Transaction
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://pump.fun/${createdToken.mint}`, '_blank')}
                        className="text-green-600 border-green-600 hover:bg-green-600/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View on Pump.fun
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://dexscreener.com/solana/${createdToken.mint}`, '_blank')}
                        className="text-green-600 border-green-600 hover:bg-green-600/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View on DEX Screener
                      </Button>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Token Creation Form */}
        <TokenCreate onTokenCreated={handleTokenCreated} />

        {/* Create Another Token Button */}
        {createdToken && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={() => setCreatedToken(null)}
              variant="outline"
              className="bg-transparent border-primary/30 hover:bg-primary/10"
            >
              Create Another Token
            </Button>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                View All Tokens
              </Button>
            </Link>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-primary/5 border border-primary/30 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Token Creation Guide</h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">1. Prepare Your Token Details</h3>
                <p>Have your token name, symbol, description, and image ready. The image should be 512x512px for best results.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">2. Connect Your Wallet</h3>
                <p>Make sure you have enough SOL in your wallet for the dev buy amount plus transaction fees (typically ~0.01 SOL).</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">3. Set Dev Buy Amount</h3>
                <p>This is the amount of SOL you'll use to buy your own token upon creation. Higher amounts create initial liquidity.</p>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">4. Review and Create</h3>
                <p>Double-check all details before creating. Once created, the token details cannot be changed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
