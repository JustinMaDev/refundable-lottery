import React, { useState, useRef } from "react";
import Countdown from "react-countdown";
import { useWalletConnect } from '../contract';
import useLotteryData from '../hooks/useLotteryData';
import NumberInput from "./NumberInput";
import RulePortal from "./RulePortal";
import { useTranslation } from "react-i18next";
import RuntimeErrorPortal from "./RuntimeErrorPortal";
import ExchangePortal from "./ExchangePortal";
import Socialbar from "./Socialbar";
const LotteryDashboard = () => {
  const { t } = useTranslation();
  const { provider, isConnected, lotteryContract} = useWalletConnect();
  const [ luckyNumber, setLuckyNumber ] = useState(0);

  const { roundNumber, countdownKey, countdownDate, ticketCount, 
    prizepool, ticketPriceInEther, ticketPriceInChips, holderEtherTickets,
    holderChipsTickets, curRoundState, stateTips, ticketMaxNumber  } = useLotteryData();

  const runtimeErrorPortalRef = useRef();

  const handleOperation = async () => {
    if (!provider || !isConnected) return;
    try {
      console.log("curRoundState", curRoundState);
      if(curRoundState === "ReadyToRoll") {
        await lotteryContract.rollTheDice();
      } else if(curRoundState === "ReadyToDraw") {
        await lotteryContract.drawLottery();
      }
    } catch (error) {
      runtimeErrorPortalRef.current.open(error);
    }
  };

  const buyTicketWithEther = async () => {
    if (!provider || !isConnected) return;
    const priceInEther = await lotteryContract.TICKET_PRICE_IN_ETHER();

    try {
      await lotteryContract.buyTicketWithEther(luckyNumber,{
        value: priceInEther,
      });
    } catch (error) {
      runtimeErrorPortalRef.current.open(error);
    }
  };

  const buyTicketWithChips =async  () => {
    if (!provider || !isConnected) return;
    try {
      await lotteryContract.buyTicketWithChips(luckyNumber);
    } catch (error) {
      runtimeErrorPortalRef.current.open(error);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-3xl  ml-2 h-[calc(100vh-5rem)]">
      {/* Round State Button And Rules Tutton */}
      <div className="flex items-center justify-between mb-4">
        <button 
          className="btn btn-outline tooltip tooltip-right"
          data-tip={t(stateTips)}
          onClick={handleOperation}
        >
          {t("round") + " " + roundNumber + " : " + t(curRoundState)}
        </button>
        <RulePortal />
      </div>

      <RuntimeErrorPortal ref={runtimeErrorPortalRef} />

      {/* Countdown Timer */}
      <div className="text-center mb-8">
        <h2 className="text-gray-400 text-lg">{t("time_until_round_ends")}</h2>
        <div className="text-4xl font-bold text-white">
          <Countdown key={countdownKey} date={countdownDate} />
        </div>
      </div>

      {/* Round Info Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center">
          <h3 className="text-gray-400 text-sm">{t("ticket_price")}</h3>
          <p className="text-2xl font-bold text-white">{ticketPriceInEther}</p>
        </div>
        <div className="text-center">
          <h3 className="text-gray-400 text-sm">{t("ticket_price")}</h3>
          <p className="text-2xl font-bold text-white">{ticketPriceInChips}</p>
        </div>
        <div className="text-center">
          <h3 className="text-gray-400 text-sm">{t("total_tickets")}</h3>
          <p className="text-2xl font-bold text-white">{ticketCount}</p>
        </div>
        <div className="text-center">
          <h3 className="text-yellow-500 text-sm">{t("prize_pool")}</h3>
          <p className="text-2xl font-bold text-white">{prizepool}</p>
        </div>
      </div>

      <div className="flex justify-around items-center bg-gray-800 p-4 rounded-lg mb-8">
        <div className="text-center">
          <h3 className="text-gray-400 text-sm">{t("my_ether_tickets")}</h3>
          <p className="text-2xl font-bold">{holderEtherTickets}</p>
        </div>
        <div className="text-center">
          <h3 className="text-gray-400 text-sm">{t("my_chips_tickets")}</h3>
          <p className="text-2xl font-bold">{holderChipsTickets}</p>
        </div>
      </div>

      <div className="flex justify-around items-center bg-gray-800 p-4 rounded-lg mb-8">
        <NumberInput onChange={(value)=>{setLuckyNumber(value)}} maxNumber={ticketMaxNumber}/>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          className="btn btn-primary"
          onClick={buyTicketWithEther}
        >
          {t("using") + " " + ticketPriceInEther}
        </button>  
        <ExchangePortal />
        <button
          className="btn btn-primary"
          onClick={buyTicketWithChips}
        >
          {t("fifty_percent_off_with_chips")}
        </button>
      </div>

      {/* Social Media Links Buttons*/}
      <Socialbar />
    </div>
  );
};

export default LotteryDashboard;
