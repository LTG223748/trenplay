// utils/token-utils.ts
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

export async function sendTC(fromWallet: PublicKey, amount: number) {
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const TRENCOIN_MINT = new PublicKey('zM7MYmkHhsVmDrq9YS3XLEjparaoMuGPHS66r2UZE99'); // Replace this

  const senderATA = await getAssociatedTokenAddress(TRENCOIN_MINT, fromWallet);
  const receiverATA = new PublicKey('RECEIVER_WALLET_ADDRESS'); // hardcoded backend or lobby wallet

  const tx = new Transaction().add(
    createTransferInstruction(
      senderATA,
      receiverATA,
      fromWallet,
      amount,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const latestBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = fromWallet;

  // You will sign/send this from the frontend
  return tx;
}
