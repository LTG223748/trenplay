import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

const TREN_MINT = process.env.NEXT_PUBLIC_TREN_MINT_ADDRESS!;
const NETWORK = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export default function WalletBalance() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<null | number>(null);

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(null);
      return;
    }

    const connection = new Connection(NETWORK, "confirmed");
    const fetchBalance = async () => {
      try {
        const mint = new PublicKey(TREN_MINT);
        const ata = await getAssociatedTokenAddress(
          mint,
          publicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const accountInfo = await connection.getTokenAccountBalance(ata);
        setBalance(Number(accountInfo.value.uiAmount));
      } catch (e) {
        setBalance(0);
      }
    };

    fetchBalance();

    // Optionally refresh every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connected]);

  if (!connected) return null;

  return (
    <div className="bg-[#1a1a2e] px-3 py-1 rounded-lg font-bold text-yellow-300 mt-2 inline-block text-sm">
      TrenCoin Balance: {balance !== null ? balance : "..."} TC
    </div>
  );
}
