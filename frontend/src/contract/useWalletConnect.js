import {  createContext, useContext, useState, useEffect } from 'react';
import {ethers} from 'ethers';
import { createAppKit, useAppKit, useAppKitProvider, useAppKitAccount  } from '@reown/appkit/react'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet, sepolia } from '@reown/appkit/networks'
import { Contract } from './index';

const WalletConnectContext = createContext();

export function WalletConnectWrapper({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [lotteryContract, setLotteryContract] = useState(null);

  const projectId = process.env.REACT_APP_REOWN_PROJECT_ID;
  const networks = [sepolia, mainnet];
  const metadata = {
    name: 'RefundableLottery',
    description: 'Refundable Lottery',
    url: 'https://refundable-lottery.com',
    icons: ['https://assets.reown.com/reown-profile-pic.png']
  }

  createAppKit({
    adapters: [new Ethers5Adapter()],
    networks,
    metadata,
    projectId,
    features: {
      analytics: true // Optional - defaults to your Cloud configuration
    }
  })
  const { open } = useAppKit();
  const { walletProvider } = useAppKitProvider('eip155');
  const { address, isConnected } = useAppKitAccount();
  
  useEffect(() => {
    console.log("useEffect isConnected: ", isConnected);
    if (isConnected && !provider) {
      console.log("create Web3Provider: ", isConnected);
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      setProvider(ethersProvider);
      const contractConfig = Contract.RefundableLottery;
      const contract = new ethers.Contract(contractConfig.address, contractConfig.abi, signer);
      setLotteryContract(contract);
    }
    if(!isConnected){
      lotteryContract?.removeAllListeners();
      setProvider(null);
      setLotteryContract(null);
    }
    
    setAccount(address);
    console.log("signer address: ", address);

    return () => {
      lotteryContract?.removeAllListeners();
    };
  }, [isConnected, address]);

  const connect = async () => {
    try {
      open();
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  return (
    <WalletConnectContext.Provider value={{ chainId, account, provider, isConnected, connect, lotteryContract}}>
      {children}
    </WalletConnectContext.Provider>
  );
}

export const useWalletConnect = () => {
  return useContext(WalletConnectContext);
};
