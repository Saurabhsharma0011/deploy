import { Connection, VersionedTransaction, TransactionSignature } from '@solana/web3.js';

export interface SendTransactionOptions {
  skipPreflight?: boolean;
  preflightCommitment?: 'processed' | 'confirmed' | 'finalized';
  maxRetries?: number;
  confirmationTimeout?: number;
}

export async function sendAndConfirmVersionedTransaction(
  connection: Connection,
  transaction: VersionedTransaction,
  options: SendTransactionOptions = {}
): Promise<TransactionSignature> {
  const {
    skipPreflight = false,
    preflightCommitment = 'confirmed',
    maxRetries = 3,
    confirmationTimeout = 30000, // 30 seconds
  } = options;

  // Send the transaction
  const signature = await connection.sendTransaction(transaction, {
    skipPreflight,
    preflightCommitment,
    maxRetries,
  });

  // Create a promise that resolves when transaction is confirmed
  const confirmationPromise = connection.confirmTransaction(signature, 'confirmed');
  
  // Create a timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Transaction confirmation timeout after ${confirmationTimeout}ms`));
    }, confirmationTimeout);
  });

  // Race between confirmation and timeout
  await Promise.race([confirmationPromise, timeoutPromise]);

  return signature;
}

export async function checkTransactionStatus(
  connection: Connection,
  signature: TransactionSignature
): Promise<{
  confirmed: boolean;
  finalized: boolean;
  error?: string;
}> {
  try {
    const status = await connection.getSignatureStatus(signature);
    
    return {
      confirmed: status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized',
      finalized: status.value?.confirmationStatus === 'finalized',
      error: status.value?.err ? String(status.value.err) : undefined,
    };
  } catch (error) {
    return {
      confirmed: false,
      finalized: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getExplorerUrl(signature: TransactionSignature, cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'mainnet-beta'): string {
  const baseUrl = cluster === 'mainnet-beta' 
    ? 'https://solscan.io/tx' 
    : `https://solscan.io/tx?cluster=${cluster}`;
  
  return `${baseUrl}/${signature}`;
}
