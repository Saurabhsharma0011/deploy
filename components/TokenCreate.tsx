"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction, Keypair } from '@solana/web3.js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Coins, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TokenCreateProps {
  onTokenCreated?: (tokenData: any) => void;
}

export const TokenCreate = ({ onTokenCreated }: TokenCreateProps) => {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    twitter: "",
    telegram: "",
    website: "",
    devBuyAmount: "1",
    slippage: "10",
    priorityFee: "0.0005"
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<{
    type: 'idle' | 'uploading' | 'creating' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setStatus({ type: 'error', message: 'Please select a valid image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Image size must be less than 5MB' });
        return;
      }
      
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setStatus({ type: 'idle', message: '' });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setStatus({ type: 'error', message: 'Token name is required' });
      return false;
    }
    if (!formData.symbol.trim()) {
      setStatus({ type: 'error', message: 'Token symbol is required' });
      return false;
    }
    if (!formData.description.trim()) {
      setStatus({ type: 'error', message: 'Token description is required' });
      return false;
    }
    if (!image) {
      setStatus({ type: 'error', message: 'Token image is required' });
      return false;
    }
    if (isNaN(Number(formData.devBuyAmount)) || Number(formData.devBuyAmount) <= 0) {
      setStatus({ type: 'error', message: 'Invalid dev buy amount' });
      return false;
    }
    return true;
  };

  const createToken = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction) {
      setStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    setStatus({ type: 'uploading', message: 'Uploading metadata to IPFS...' });

    try {
      // Step 1: Upload metadata to IPFS
      const metadataFormData = new FormData();
      metadataFormData.append("file", image!);
      metadataFormData.append("name", formData.name);
      metadataFormData.append("symbol", formData.symbol);
      metadataFormData.append("description", formData.description);
      metadataFormData.append("twitter", formData.twitter || "");
      metadataFormData.append("telegram", formData.telegram || "");
      metadataFormData.append("website", formData.website || "");
      metadataFormData.append("showName", "true");

      const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: metadataFormData,
      });

      if (!metadataResponse.ok) {
        throw new Error(`Failed to upload metadata: ${metadataResponse.statusText}`);
      }

      const metadataResponseJSON = await metadataResponse.json();
      
      setStatus({ type: 'creating', message: 'Creating token transaction...' });

      // Step 2: Generate mint keypair (this will be signed locally)
      const mintKeypair = Keypair.generate();

      // Step 3: Get the create transaction from PumpPortal
      const response = await fetch('/api/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          action: "create",
          tokenMetadata: {
            name: metadataResponseJSON.metadata.name,
            symbol: metadataResponseJSON.metadata.symbol,
            uri: metadataResponseJSON.metadataUri
          },
          mint: mintKeypair.publicKey.toBase58(),
          denominatedInSol: "true",
          amount: Number(formData.devBuyAmount),
          slippage: Number(formData.slippage),
          priorityFee: Number(formData.priorityFee),
          pool: "pump"
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate transaction: ${errorText}`);
      }

      setStatus({ type: 'creating', message: 'Signing transaction...' });

      // Step 4: Sign and send transaction
      const transactionData = await response.arrayBuffer();
      const transaction = VersionedTransaction.deserialize(new Uint8Array(transactionData));
      
      setStatus({ type: 'creating', message: 'Signing transaction...' });
      
      // First, sign with the mint keypair
      transaction.sign([mintKeypair]);
      
      // Then sign with the user's wallet
      const signedTransaction = await signTransaction(transaction);
      
      setStatus({ type: 'creating', message: 'Broadcasting transaction...' });
      
      // Send the transaction to the network (matching your trading logic)
      const signature = await connection.sendTransaction(signedTransaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
      
      // Wait for confirmation
      setStatus({ type: 'creating', message: 'Confirming transaction...' });
      await connection.confirmTransaction(signature, 'confirmed');
      
      setStatus({ 
        type: 'success', 
        message: `Token created successfully! Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}` 
      });

      // Call callback with token data
      onTokenCreated?.({
        mint: mintKeypair.publicKey.toBase58(),
        name: formData.name,
        symbol: formData.symbol,
        signature,
        metadata: metadataResponseJSON
      });

      // Reset form
      setFormData({
        name: "",
        symbol: "",
        description: "",
        twitter: "",
        telegram: "",
        website: "",
        devBuyAmount: "1",
        slippage: "10",
        priorityFee: "0.0005"
      });
      setImage(null);
      setImagePreview(null);

    } catch (error: any) {
      console.error('Token creation error:', error);
      setStatus({ 
        type: 'error', 
        message: `Error: ${error.message || error.toString()}` 
      });
    } finally {
      setIsCreating(false);
    }
  }, [connected, publicKey, signTransaction, connection, formData, image, onTokenCreated]);

  return (
    <Card className="bg-transparent border border-primary/30 shadow-lg shadow-primary/20 w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Coins className="w-6 h-6 text-primary" />
          Create New Token
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        {status.type !== 'idle' && (
          <Alert className={`${
            status.type === 'error' ? 'border-destructive bg-destructive/10' :
            status.type === 'success' ? 'border-green-500 bg-green-500/10' :
            'border-primary bg-primary/10'
          }`}>
            {status.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {status.type === 'success' && <CheckCircle className="h-4 w-4" />}
            <AlertDescription className={
              status.type === 'error' ? 'text-destructive' :
              status.type === 'success' ? 'text-green-600' :
              'text-primary'
            }>
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Token Name *</Label>
              <Input
                id="name"
                placeholder="e.g., My Awesome Token"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-transparent border-primary/30"
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="symbol">Token Symbol *</Label>
              <Input
                id="symbol"
                placeholder="e.g., MAT"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                className="bg-transparent border-primary/30"
                disabled={isCreating}
                maxLength={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your token..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-transparent border-primary/30 min-h-20"
              disabled={isCreating}
            />
          </div>
        </div>

        {/* Token Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Token Image *</h3>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-transparent border-primary/30"
                disabled={isCreating}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Max 5MB. Recommended: 512x512px
              </p>
            </div>
            
            {imagePreview && (
              <div className="w-20 h-20 rounded-lg border border-primary/30 overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Token preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Links (Optional)</h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourtoken.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="bg-transparent border-primary/30"
                disabled={isCreating}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/yourtoken"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  className="bg-transparent border-primary/30"
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram</Label>
                <Input
                  id="telegram"
                  placeholder="https://t.me/yourtoken"
                  value={formData.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  className="bg-transparent border-primary/30"
                  disabled={isCreating}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Advanced Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="devBuyAmount">Dev Buy (SOL)</Label>
              <Input
                id="devBuyAmount"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="1"
                value={formData.devBuyAmount}
                onChange={(e) => handleInputChange('devBuyAmount', e.target.value)}
                className="bg-transparent border-primary/30"
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slippage">Slippage (%)</Label>
              <Input
                id="slippage"
                type="number"
                step="1"
                min="1"
                max="50"
                placeholder="10"
                value={formData.slippage}
                onChange={(e) => handleInputChange('slippage', e.target.value)}
                className="bg-transparent border-primary/30"
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priorityFee">Priority Fee (SOL)</Label>
              <Input
                id="priorityFee"
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="0.0005"
                value={formData.priorityFee}
                onChange={(e) => handleInputChange('priorityFee', e.target.value)}
                className="bg-transparent border-primary/30"
                disabled={isCreating}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          {connected ? (
            <Button
              onClick={createToken}
              disabled={isCreating}
              className="w-full bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/50 rounded-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  {status.type === 'uploading' ? 'Uploading...' : 
                   status.type === 'creating' ? 'Creating...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Create Token
                </>
              )}
            </Button>
          ) : (
            <div className="text-center">
              <WalletMultiButton className="!bg-primary !text-primary-foreground !font-semibold !px-6 !py-3 !rounded-xl !hover:bg-primary/90 !transition-all !duration-200 !border-none !shadow-lg !hover:shadow-primary/50 !transform !hover:scale-105 !active:scale-95" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
