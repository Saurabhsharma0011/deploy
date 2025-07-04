"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, BarChart3 } from "lucide-react";

interface ChartIframeProps {
  tokenMint: string;
  tokenSymbol: string;
  className?: string;
}

export const ChartIframe = ({ tokenMint, tokenSymbol, className = "" }: ChartIframeProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const chartUrl = `https://www.gmgn.cc/kline/sol/${tokenMint}?interval=1S`;

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const openInNewTab = () => {
    window.open(chartUrl, '_blank');
  };

  if (hasError) {
    return (
      <div className={`bg-primary/5 border border-primary/30 rounded-xl p-8 text-center ${className}`}>
        <BarChart3 className="w-16 h-16 text-primary/30 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Chart data temporarily unavailable</p>
        <Button
          onClick={openInNewTab}
          variant="outline"
          size="sm"
          className="bg-transparent border-primary/30 hover:bg-primary/10"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on GMGN.cc
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative bg-card border border-primary/30 rounded-xl overflow-hidden ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/5 z-10">
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-primary animate-pulse mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading {tokenSymbol} chart...</p>
          </div>
        </div>
      )}

      {/* Chart Iframe */}
      <iframe
        src={chartUrl}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        title={`${tokenSymbol} Price Chart`}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        loading="lazy"
      />

      {/* Open in New Tab Button */}
      <Button
        onClick={openInNewTab}
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border-primary/30 hover:bg-background/90 opacity-75 hover:opacity-100 transition-opacity"
      >
        <ExternalLink className="w-3 h-3" />
      </Button>
    </div>
  );
};
