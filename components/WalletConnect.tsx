// components/WalletConnect.tsx
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletConnect = () => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <WalletMultiButton />
    </div>
  );
};

export default WalletConnect;
