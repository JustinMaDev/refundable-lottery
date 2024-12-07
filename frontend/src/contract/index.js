import RefundableLotteryAbi from './RefundableLottery.json'
import {ethers} from 'ethers';

const ETHEREUM_MAINNET = {
  chainId: '0x1',
  chainName: 'Ethereum Mainnet',
};

const ETHEREUM_SEPOLIA = {
  chainId: '0xaa36a7',
  chainName: 'Ethereum Sepolia Testnet',
  blockExplorer: 'https://sepolia.etherscan.io/',
  blockExplorerTx: 'https://sepolia.etherscan.io/tx/',
  blockExplorerAddress: 'https://sepolia.etherscan.io/address/',
};

const BINANCE_MAINNET = {
  chainId: '0x38',
  chainName: 'Binance Smart Chain Mainnet',
  blockExplorer: 'https://etherscan.io/',
  blockExplorerTx: 'https://etherscan.io/tx/',
  blockExplorerAddress: 'https://etherscan.io/address/',
};

const BINANCE_TESTNET = {
  chainId: '0x61',
  chainName: 'Binance Smart Chain Testnet',
};

const TARGET_NETWORK = ETHEREUM_SEPOLIA;

async function _createInstance(contractConfig, provider) {
  const signer = provider?.getSigner();
  const network = await provider?.getNetwork();
  if (network?.chainId !== parseInt(Contract.NETWORK.chainId, 16)) {
    console.error("ChainId not match, please switch to correct network, current chainId: ", network?.chainId, 
                  " contract ", contractConfig.contractName, " was deployed on chain: ", Contract.NETWORK.chainId);
    return null;
  }
  contractConfig._instance = new ethers.Contract(contractConfig.address, contractConfig.abi, signer);
  return contractConfig._instance;
}

async function _getInstance(contractConfig, provider) {
  if(contractConfig._instance){
    return contractConfig._instance;
  }
  if (!contractConfig._instancePromise) {
    contractConfig._instancePromise = _createInstance(contractConfig, provider);
  }

  contractConfig._instance = await contractConfig._instancePromise;
  contractConfig._instancePromise = null;
  return contractConfig._instance;
}

export const Contract = {
  NETWORK:TARGET_NETWORK,
  
  RefundableLottery:{
    contractName:RefundableLotteryAbi.contractName,
    address: "0x48ccb41f6321eafaeb75bce37abd362a53a879b1",
    creationBlockNumber: 7193618,
    abi:RefundableLotteryAbi.abi,
    _instance: null,
    _instancePromise: null,
    getInstance:async function(provider){
      return await _getInstance(this, provider);
    }
  },
  
}

export { useWeb3, Web3Wrapper } from './useWeb3';