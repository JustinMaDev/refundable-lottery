import React, { useState, useRef} from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import useExchange  from "../hooks/useExchange";
import RuntimeErrorPortal from "./RuntimeErrorPortal";
import { useWalletConnect } from "../contract";
import { toWei, toEther } from "../utils";

const ExchangePortal = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");
  const { shortenAccount, etherBalance, chipsBalance, chipsBuyPrice, chipsSellPrice, ethLiquidityPool, chipsLiquidityPool } = useExchange();
  const { account, provider, isConnected, chipsContract } = useWalletConnect();

  const runtimeErrorPortalRef = useRef();

  const [fromToken, setFromToken] = useState({
    icon: "/eth-logo.svg",
    symbol: "ETH",
  });

  const [toToken, setToToken] = useState({
    icon: "/chips-logo.svg",
    symbol: "CHIP",
  });

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromValue("");
    setToValue("");
  };

  const info = {

  }
  async function handleFromValueBlur() {
    console.log("handleFromValueBlur!!!!!!!!", fromValue, "");
    if (fromToken.symbol === "ETH") {
      const chipsAmount = Number(fromValue) * 1000; //chipsBuyPrice;
      setToValue(chipsAmount.toString());
      console.log("handleFromValueBlur update tovalue: ", chipsAmount.toString());
    } else {
      const chipsAmountinWei = toWei(fromValue);
      const sellData = await chipsContract.calcSellPrice(chipsAmountinWei);
      const ethAmount = sellData[0];
      setToValue(toEther(ethAmount, 4).toString());
      console.log("handleFromValueBlur update tovalue: ", toEther(ethAmount).toString());
    }
  }
  async function handleExchange() {
    try{
      if(fromToken.symbol === "ETH"){
        // But chips using ETH
        await chipsContract.buyChips({value: toWei(fromValue)});
      }else{
        // Sell chips to ETH
        await chipsContract.sellChips(toWei(fromValue));
      }
    }catch(error){
      runtimeErrorPortalRef.current.open(error);
    }
  }

  return (
    <div>
      <button
        className="btn btn-outline"
        onClick={() => setIsOpen(true)}
      >
        {t("buy_sell_chips")}
      </button>
      {isOpen &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 text-white rounded-lg p-6">
            <RuntimeErrorPortal ref={runtimeErrorPortalRef} />
            <h1 className="text-center font-bold mb-4">{t("chipstoken_exchange")}</h1>
              {/* From Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t("from")}</label>
                <div className="flex items-center bg-gray-700 rounded-lg p-3">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={fromValue}
                    onChange={(e)=>setFromValue(e.target.value)}
                    onBlur={handleFromValueBlur}
                    className="bg-transparent text-white outline-none w-full"
                  />
                  <div className="mr-4 flex items-center gap-2">
                    <img src={fromToken.icon} alt="ETH" className="w-5 h-5" />
                    <span>{fromToken.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Swap Icon */}
              <div className="flex items-center justify-center my-2">
                <button className="btn btn-circle btn-sm btn-secondary" onClick={swapTokens}>
                  <span className="text-lg">⇅</span>
                </button>
              </div>

              {/* To Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t("to")}</label>
                <div className="flex items-center bg-gray-700 rounded-lg p-3">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={toValue}
                    onChange={(e)=>setToValue(e.target.value)}
                    className="bg-transparent text-white outline-none w-full"
                    disabled
                  />
                  <div className="mr-4 flex items-center gap-2">
                    <img src={toToken.icon} alt="CHIP" className="w-5 h-5" />
                    <span className="wr-2">{toToken.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="text-sm bg-gray-700 p-4 rounded-lg mb-4">
                <p className="flex justify-between">
                  <span>{t("your_account")}</span>
                  <span>{shortenAccount}</span>
                </p>
                <p className="flex justify-between">
                  <span>{t("ether_balance")}</span>
                  <span>{etherBalance}</span>
                </p>
                <p className="flex justify-between">
                  <span>{t("chips_balance")}</span>
                  <span>{chipsBalance}</span>
                </p>
                <p className="flex justify-between">
                  <span>{t("ether_liquidity_pool")}</span>
                  <span>{ethLiquidityPool}</span>
                </p>
                <p className="flex justify-between">
                  <span>{t("chips_liquidity_pool")}</span>
                  <span>{chipsLiquidityPool}</span>
                </p>
                <p className="flex justify-between">
                  <span>{t("chips_buy_price")}</span>
                  <span>{chipsBuyPrice}</span>
                </p>
                <p className="flex justify-between">
                  <span>{t("chips_sell_price")}</span>
                  <span>{chipsSellPrice}</span>
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button className="btn btn-primary bg-gray-600" onClick={handleExchange}>{t("exchange")}</button>
              </div>
              <button
                className="btn btn-primary mt-4"
                onClick={() => setIsOpen(false)}
              >
                {t("close")}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ExchangePortal;
