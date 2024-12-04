import RefundableLotteryAbi from './RefundableLottery.json'

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

export const Contract = {
  NETWORK:TARGET_NETWORK,
  
  RefundableLottery:{
    contractName:RefundableLotteryAbi.contractName,
    address: "0x2acc805ce5ed2695832eead1dd95e662f853f688",
    creationBlockNumber: 7193618,
    abi:RefundableLotteryAbi.abi,
    _instance: null,
    getInstance:async function(web3){
      return await Contract._getInstance(this, web3);
    }
  },
  
  _getInstance: async function (contractConfig, web3) {
    if (contractConfig._instance) {
      return contractConfig._instance;
    }
    const chainId = await web3?.eth.getChainId();
    if (parseInt(chainId) !== parseInt(Contract.NETWORK.chainId, 16)) {
      console.error("ChainId not match, please switch to correct network, current chainId: ", chainId, 
                    " contract ", contractConfig.contractName, " was deployed on chain: ", Contract.NETWORK.chainId);
      return null;
    }
    contractConfig._instance = new web3.eth.Contract(contractConfig.abi, contractConfig.address);
    return contractConfig._instance;
  }
}

export { useWeb3, Web3Wrapper } from './useWeb3';