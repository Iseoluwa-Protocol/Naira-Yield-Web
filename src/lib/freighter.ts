import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

/**
 * Checks if the Freighter browser extension is installed and available.
 */
export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    return await isConnected();
  } catch (error) {
    console.warn('Freighter is not installed or not responding.', error);
    return false;
  }
}

/**
 * Retrieves the public G-address of the connected Freighter wallet.
 * Returns null if not connected or unauthorized.
 */
export async function getUserAddress(): Promise<string | null> {
  try {
    const installed = await checkFreighterInstalled();
    if (!installed) {
      return null;
    }
    const publicKey = await getPublicKey();
    return publicKey || null;
  } catch (error) {
    console.error('Failed to get public key from Freighter:', error);
    return null;
  }
}

/**
 * Initiates the sign transaction prompt in the Freighter extension.
 * @param xdr - The transaction XDR payload string.
 * @param network - The target Stellar network ('TESTNET' or 'PUBLIC').
 * @returns The signed transaction XDR payload or null if rejected.
 */
export async function signTx(xdr: string, network: 'TESTNET' | 'PUBLIC' = 'TESTNET'): Promise<string | null> {
  try {
    const signedXdr = await signTransaction(xdr, {
      network,
    });
    return signedXdr || null;
  } catch (error) {
    console.error('Failed to sign transaction with Freighter:', error);
    return null;
  }
}
