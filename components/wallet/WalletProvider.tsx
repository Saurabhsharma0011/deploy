"use client";

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import the CSS for wallet modal styling
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet;

  // RPC endpoint configuration
  const endpoint = useMemo(() => {
    // Check for custom RPC endpoint in environment variables
    const customEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;
    
    if (customEndpoint) {
      console.log('Using custom RPC endpoint:', customEndpoint);
      return customEndpoint;
    }
    
    // Fallback to default Solana RPC
    const defaultEndpoint = clusterApiUrl(network);
    console.log('Using default Solana RPC:', defaultEndpoint);
    return defaultEndpoint;
  }, [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  // Only include the wallets you want to support
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
