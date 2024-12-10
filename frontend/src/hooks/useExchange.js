import { useState, useEffect } from "react";
import { useWalletConnect} from '../contract';
import { toWei, toEther, shortenString } from '../utils';
import { parse } from "postcss";
import { chips } from "@reown/appkit/networks";

const useExchange = () => {
  const { account, provider, isConnected, chipsContract} = useWalletConnect();
  const [chipsBalance, setChipsBalance] = useState("0");
  const [etherBalance, setEtherBalance] = useState("0");
  const [shortenAccount, setShortenAccount] = useState("");
  const [chipsBuyPrice, setChipsBuyPrice] = useState("0");
  const [chipsSellPrice, setChipsSellPrice] = useState("0");
  const [ethLiquidityPool, setEthLiquidityPool] = useState("0");
  const [chipsLiquidityPool, setChipsLiquidityPool] = useState("0");
  useEffect(() => {
    if (!account || !provider || !isConnected || !chipsContract) return;

    const fetchStaticData = async () => {
      setShortenAccount(shortenString(account));

      const ethBalance = await provider.getBalance(account);
      setEtherBalance(toEther(ethBalance));

      const chipsBalance = await chipsContract.balanceOf(account);
      setChipsBalance(toEther(chipsBalance));

      const buyPrice = await chipsContract.CHIPS_PRICE_PER_ETHER();
      setChipsBuyPrice(buyPrice.toString());
    };

    const fetchDynamicData = async () => {
      console.log("sellPriceData", toWei("1").toString());
      const sellPriceData = await chipsContract.calcSellPrice(toWei("1000"));
      const ethToTransfer = sellPriceData[0];
      const managerFee = sellPriceData[1];
      
      const ethPool = await chipsContract.liquidityPoolEther();
      const chipsPool = await chipsContract.liquidityPoolChips();
      setChipsSellPrice(toEther(ethToTransfer, 4));
      setEthLiquidityPool(toEther(ethPool, 4));
      setChipsLiquidityPool(toEther(chipsPool));
    };

    const listen = async () => {
      chipsContract.on("BuyChips", (buyer, ethAmount, chipsAmount, liquidityPoolEther, liquidityPoolChips, managerFee, event) => {
        if(buyer.toUpperCase() === account.toUpperCase()){
          fetchStaticData();
        }
        fetchDynamicData();
      });
      chipsContract.on("SellChips", (seller, ethAmount, chipsAmount, liquidityPoolEther, liquidityPoolChips, managerFee, event) => {
        if(seller.toUpperCase() === account.toUpperCase()){
          fetchStaticData();
        }
        fetchDynamicData();
      });
    }

    if(isConnected){
      fetchStaticData();
      fetchDynamicData();
      listen();
    }else{
      setChipsBalance(0);
      setEtherBalance(0);
      setShortenAccount('');
      setChipsBuyPrice(0);
      setChipsSellPrice(0);
    }
  }, [account, provider, isConnected, chipsContract]);

  return { shortenAccount, etherBalance, chipsBalance, chipsBuyPrice, chipsSellPrice, ethLiquidityPool, chipsLiquidityPool };
}

export default useExchange;