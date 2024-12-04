import hardhat, { ethers } from "hardhat";
import { ethers as ethersJs } from "ethers";
import fs from "fs";
import config from "./config.json";
import operations from "./operations.json";

let env = null;

function getRealArg(operation) {
  let realArgs: [...any[]] = [];
  for (const arg of operation.args) {
    let realArg = null;
    if(typeof arg == "string" && arg.startsWith("$")) {
      realArg = env[arg.slice(1)];
    }else {
      realArg = arg;
    }
    if(realArg.startsWith("$BigNum:")) {
      realArg = ethers.toBigInt(realArg.slice(8));
    }
    realArgs.push(realArg);
  }
  return realArgs;
}

async function genDeploymentTx(operation) {
  const contract = await ethers.getContractFactory(operation.name);
  let realArgs: [...any[]] = getRealArg(operation);
  
  console.log("genDeploymentTx name:", operation.name, "genDeploymentTx args:", realArgs);
  const unsignedTx = await contract.getDeployTransaction(...realArgs);
  const feeData = await ethers.provider.getFeeData();
  const gasEstimate = await ethers.provider.estimateGas({
    from: env.deployer,
    to: null,
    data: unsignedTx.data,
  });
  console.log(
    `\x1b[32mDeploy ${operation.name} contract at nonce: ${env.nonce}, 
    Gas Estimate: ${gasEstimate}, 
    Gas Price: ${feeData.gasPrice.toString()} 
    Max Fee Per Gas: ${feeData.maxFeePerGas.toString()}
    Max Priority Fee Per Gas: ${feeData.maxPriorityFeePerGas.toString()}
    \x1b[0m`
  );

  env[operation.name] = ethers.getCreateAddress({from:env.deployer, nonce:env.nonce});

  return {
    from: env.deployer,
    to: null,
    value: operation.value,
    data: unsignedTx.data,
    gasLimit: ethers.toBeHex(gasEstimate),
    //gasPrice: ethers.toBeHex(feeData.gasPrice),
    maxFeePerGas: ethers.toBeHex(feeData.maxFeePerGas),
    maxPriorityFeePerGas: ethers.toBeHex(feeData.maxPriorityFeePerGas*ethers.toBigInt(2)),
    nonce: ethers.toBeHex(env.nonce),
    chainId: ethers.toBeHex(hardhat.network.config.chainId),
  };
}

async function getInvocationTx(operation) {
  console.log("getInvocationTx name:", operation.name);
  const contractAddr = env[operation.name];
  const contract = await ethers.getContractAt(operation.name, contractAddr);
  const realArgs = getRealArg(operation);

  const unsignedTx = await contract[operation.function].populateTransaction(...realArgs);
  const feeData = await ethers.provider.getFeeData();
  const gasEstimate = await ethers.provider.estimateGas({
    from: env.deployer,
    to: contractAddr,
    data: unsignedTx.data,
  });

  return {
    from: env.deployer,
    to: contractAddr,
    value: operation.value,
    data: unsignedTx.data,
    gasLimit: ethers.toBeHex(gasEstimate),
    //gasPrice: ethers.toBeHex(feeData.gasPrice),
    maxFeePerGas: ethers.toBeHex(feeData.maxFeePerGas),
    maxPriorityFeePerGas: ethers.toBeHex(feeData.maxPriorityFeePerGas*ethers.toBigInt(2)),
    nonce: ethers.toBeHex(env.nonce),
    chainId: ethers.toBeHex(hardhat.network.config.chainId),
  };

}
async function main(){
  env = config[hardhat.network.name];
  env.nonce = await ethers.provider.getTransactionCount(env.deployer);
  console.log("doMain: ", hardhat.network.name, "operator:", env.deployer, " from nonce:", env.nonce);

  let txList = [];
  // operations
  for (const operation of operations) {
    if(operation.type === "deploy") {
      txList.push(await genDeploymentTx(operation));
      env.nonce++;
    } else if(operation.type === "call") {
      txList.push(await getInvocationTx(operation));
      env.nonce++;
    }
  }
  const filePath = "./scripts/unsignedTx.json";
  fs.writeFileSync(filePath, JSON.stringify(txList, null, 2));
  console.log(`Unsigned transaction saved to ${filePath}`);

  const configFile = "./scripts/config_nonce_" + env.nonce + ".json";
  fs.writeFileSync(configFile, JSON.stringify(env, null, 2));
  console.log(`Config file saved to ${configFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });