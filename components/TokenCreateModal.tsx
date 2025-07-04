"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TokenCreate } from "@/components/TokenCreate";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TokenCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenCreateModal = ({ isOpen, onClose }: TokenCreateModalProps) => {
  const [createdToken, setCreatedToken] = useState<any>(null);

  const handleTokenCreated = (tokenData: any) => {
    setCreatedToken(tokenData);
    // You could also trigger a refresh of the token list here
  };

  const handleClose = () => {
    setCreatedToken(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-transparent border-2 border-primary shadow-xl shadow-primary/40 backdrop-blur-md text-foreground max-w-4xl max-h-[95vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Create New Token
          </DialogTitle>
        </DialogHeader>

        {/* Success Message */}
        {createdToken && (
          <Alert className="border-green-500 bg-green-500/10 mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-600">
              <div className="space-y-2">
                <p className="font-semibold">Token Created Successfully! 🎉</p>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {createdToken.name}</p>
                  <p><span className="font-medium">Symbol:</span> {createdToken.symbol}</p>
                  <p><span className="font-medium">Mint Address:</span> 
                    <span className="font-mono ml-1">
                      {createdToken.mint.slice(0, 8)}...{createdToken.mint.slice(-8)}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
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
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Token Creation Form */}
        {!createdToken && (
          <TokenCreate onTokenCreated={handleTokenCreated} />
        )}

        {/* Create Another Token Button */}
        {createdToken && (
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={() => setCreatedToken(null)}
              variant="outline"
              className="bg-transparent border-primary/30 hover:bg-primary/10"
            >
              Create Another Token
            </Button>
            <Button
              onClick={handleClose}
              className="bg-primary hover:bg-primary/90"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
