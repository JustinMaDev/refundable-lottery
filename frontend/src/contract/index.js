import RefundableLotteryAbi from './RefundableLottery.json'
import ChipsTokenAbi from './ChipsToken.json'

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

export { useWalletConnect, WalletConnectWrapper } from './useWalletConnect';