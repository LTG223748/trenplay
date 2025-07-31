// components/TokenBalance.tsx
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import {
  getAssociatedTokenAddress,
  getAccount
} from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

const TRENCOIN_MINT = new PublicKey('3WJYZL3npenDeutrnNHhGLpXCok3mqrmuxcLjWGCtirf');

const TokenBalance = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) return;

      try {
        const ata = await getAssociatedTokenAddress(TRENCOIN_MINT, publicKey);
        const accountInfo = await getAccount(connection, ata);
        const rawAmount = Number(accountInfo.amount);
        const adjusted = rawAmount / 1_000_000; // Adjust based on decimals
        setBalance(adjusted);
      } catch (err) {
        setBalance(0); // Probably doesn't have TC yet
      }
    };

    fetchBalance();
  }, [connection, publicKey]);

  return (
    <div>
      <h3>TrenCoin Balance: {balance !== null ? `${balance} TC` : '—'}</h3>
    </div>
  );
};

export default TokenBalance;
