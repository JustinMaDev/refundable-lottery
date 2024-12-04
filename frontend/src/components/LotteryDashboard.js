import React, { useState, useEffect } from "react";
import Countdown from "react-countdown";
import {Contract, useWeb3} from '../contract';
import web3 from 'web3';
import useLotteryData from '../hooks/useLotteryData';
import NumberInput from "./NumberInput";
import RulePortal from "./RulePortal";
import { useTranslation } from "react-i18next";

const LotteryDashboard = () => {
  const { t, i18n } = useTranslation();
  const { account, provider, isConnected} = useWeb3();
  const [ luckyNumber, setLuckyNumber ] = useState(0);

  const { roundNumber, countdownKey, countdownDate, ticketCount, 
    prizepool, ticketPriceInEther, ticketPriceInChips, holderEtherTickets,
    holderChipsTickets, curRoundState, stateTips } = useLotteryData();

  const handleOperation = async () => {
    if (!provider || !isConnected) return;
    try {
      const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
      console.log("curRoundState", curRoundState);
      if(curRoundState === "ReadyToRoll") {
        await lotteryContract.methods.rollTheDice().send({ from: account });
      } else if(curRoundState === "ReadyToDraw") {
        await lotteryContract.methods.drawLottery().send({ from: account });
      }
    } catch (error) {
      console.error("Failed to buy ticket with ether:", error);
    }
  };

  const buyTicketWithEther = async () => {
    if (!provider || !isConnected) return;
    const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
    const priceInEther = await lotteryContract.methods.TICKET_PRICE_IN_ETHER().call();

    try {
      await lotteryContract.methods.buyTicketWithEther(luckyNumber).send({
        from: account,
        value: priceInEther,
      });
    } catch (error) {
      console.error("Failed to buy ticket with ether:", error);
    }
  };

  const buyTicketWithChips =async  () => {
    if (!provider || !isConnected) return;
    try {
      const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
      await lotteryContract.methods.buyTicketWithChips(luckyNumber).send({
        from: account,
      });
    } catch (error) {
      console.error("Failed to buy ticket with chips:", error);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-3xl  ml-2">
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

      {/* Countdown Timer */}
      <div className="text-center mb-8">
        <h2 className="text-gray-400 text-lg">{t("time_until_round_ends")}</h2>
        <div className="text-4xl font-bold text-white">
          <Countdown key={countdownKey} date={countdownDate} />
        </div>
      </div>

      {/* Info Section */}
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
          <h3 className="text-gray-400 text-sm">{t("your_ether_tickets")}</h3>
          <p className="text-2xl font-bold">{holderEtherTickets}</p>
        </div>
        <div className="text-center">
          <h3 className="text-gray-400 text-sm">{t("your_chips_tickets")}</h3>
          <p className="text-2xl font-bold">{holderChipsTickets}</p>
        </div>
      </div>

      <div className="flex justify-around items-center bg-gray-800 p-4 rounded-lg mb-8">
        <NumberInput onChange={(value)=>{setLuckyNumber(value)}}/>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          className="btn btn-primary"
          onClick={buyTicketWithEther}
        >
          {t("using") + " " + ticketPriceInEther}
        </button>
        <button
          className="btn btn-primary"
          onClick={buyTicketWithChips}
        >
          {t("fifty_percent_off_with_chips")}
        </button>
      </div>
    </div>
  );
};

export default LotteryDashboard;
