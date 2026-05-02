import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'viem/chains';

// We export a function instead of a constant to ensure this 
// only runs on the client when needed.
export const getWagmiConfig = () => {
  return getDefaultConfig({
    appName: 'Zyn Stealth',
    projectId: '3b04e652eda22efc00944bf961bc2acd',
    chains: [sepolia],
    ssr: false,
  });
};
