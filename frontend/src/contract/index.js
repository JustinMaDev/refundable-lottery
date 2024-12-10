import RefundableLotteryAbi from './RefundableLottery.json'
import ChipsTokenAbi from './ChipsToken.json'
import { type } from '@testing-library/user-event/dist/type';


const ContractConfig = {
  11155111:{
    NETWORK:{
      chainId: '0xaa36a7',
      chainName: 'Ethereum Sepolia Testnet',
      blockExplorer: 'https://sepolia.etherscan.io/',
      blockExplorerTx: 'https://sepolia.etherscan.io/tx/',
      blockExplorerAddress: 'https://sepolia.etherscan.io/address/',
    },
    ChipsToken:{
      contractName:ChipsTokenAbi.contractName,
      address: "0x64fd7fe79a9a1ecc7208ca8a452afc021acb62d2",
      creationBlockNumber: 7193618,
      abi:ChipsTokenAbi.abi,
    },
    RefundableLottery:{
      contractName:RefundableLotteryAbi.contractName,
      address: "0x32c6e109f9bd9dd4a43eb56c4aacfd958ccb5c48",
      creationBlockNumber: 7193618,
      abi:RefundableLotteryAbi.abi,
    },
  }
}

export const Contract = {
  setNetworkByChainId(chainId){
    if(typeof chainId === 'string' && chainId.startsWith('0x')){
      chainId = parseInt(chainId, 16);
    }else{
      chainId = parseInt(chainId);
    }
    console.log("setNetworkByChainId: chainId: ", chainId);
    if(ContractConfig[chainId] === undefined){
      console.log("setNetworkByChainId: chainId not supported: ", chainId);
      return false;
    }
  
    // Append all items from ContractConfig[chainId] to this
    Object.assign(this, ContractConfig[chainId]);
    return true;
  },
} 
export { useWalletConnect, WalletConnectWrapper } from './useWalletConnect';