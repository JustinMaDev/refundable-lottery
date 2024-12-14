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
  const [lotteryContract, setLotteryContract] = useState(null);
  const [chipsContract, setChipsContract] = useState(null);

  const projectId = process.env.REACT_APP_REOWN_PROJECT_ID;
  const networks = [mainnet];
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

      if(!Contract.setNetworkByChainId(walletProvider.chainId)){
        return;
      }
      
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      setProvider(ethersProvider);
      
      const lottery = new ethers.Contract(Contract.RefundableLottery.address, Contract.RefundableLottery.abi, signer);
      setLotteryContract(lottery);

      const chips = new ethers.Contract(Contract.ChipsToken.address, Contract.ChipsToken.abi, signer);
      setChipsContract(chips);
    }
    if(!isConnected){
      lotteryContract?.removeAllListeners();
      chipsContract?.removeAllListeners();
      setProvider(null);
      setLotteryContract(null);
    }
    
    setAccount(address);
    console.log("signer address: ", address);

    return () => {
      lotteryContract?.removeAllListeners();
      chipsContract?.removeAllListeners();
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
    <WalletConnectContext.Provider value={{ account, provider, isConnected, connect, lotteryContract, chipsContract}}>
      {children}
    </WalletConnectContext.Provider>
  );
}

export const useWalletConnect = () => {
  return useContext(WalletConnectContext);
};
