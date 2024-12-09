import {ethers} from 'ethers';

export function toBigNumber(num) {
  return ethers.BigNumber.from(num);
}

export function toEther(num, fixed = 2) {
  return parseFloat(ethers.utils.formatUnits(num, 'ether')).toFixed(fixed);
}

export function toHex(num) {
  return ethers.utils.hexlify(num);
}

export function toWei(num) {
  return ethers.utils.parseEther(num);
}

export function shortenString(str, startLength = 6, endLength = 4) {
  if (!str || str.length < startLength + endLength) {
    return str;
  }
  const start = str.slice(0, startLength);
  const end = str.slice(-endLength);
  return `${start}...${end}`;
}
