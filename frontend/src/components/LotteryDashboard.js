import React, { useState, useEffect } from "react";
import Countdown from "react-countdown";
import {Contract, useWeb3} from '../contract';
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

  const github = "https://github.com";
  const blockchainExplorer = "https://bscscan.com";
  const twitter = "https://x.com";
  const telegram = "https://t.me";
  const facebook = "https://facebook.com";
  const thread = "https://thread.com";
  const discord = "https://discord.com";

  const handleOperation = async () => {
    if (!provider || !isConnected) return;
    try {
      const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
      console.log("curRoundState", curRoundState);
      if(curRoundState === "ReadyToRoll") {
        await lotteryContract.rollTheDice();
      } else if(curRoundState === "ReadyToDraw") {
        await lotteryContract.drawLottery();
      }
    } catch (error) {
      console.error("Failed to buy ticket with ether:", error);
    }
  };

  const buyTicketWithEther = async () => {
    if (!provider || !isConnected) return;
    const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
    const priceInEther = await lotteryContract.TICKET_PRICE_IN_ETHER();

    try {
      await lotteryContract.buyTicketWithEther(luckyNumber,{
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
      await lotteryContract.buyTicketWithChips(luckyNumber);
    } catch (error) {
      console.error("Failed to buy ticket with chips:", error);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-3xl  ml-2 h-[calc(100vh-5rem)]">
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
      <div className="flex flex-wrap justify-evenly items-center mt-16 gap-4 w-full">
        <a href={github} target="_blank" rel="noopener noreferrer">
          <img src="/github-mark-white.png" alt="Github" className="w-6 h-6 " title={t("go_to_github")} />
        </a>
        <a href={blockchainExplorer} target="_blank" rel="noopener noreferrer">
          <img src="/blockchain_explorer.png" alt="Blockchain Explorer" className="w-6 h-6 " title={t("go_to_blockchain_explorer")} />
        </a>
        <a href={twitter} target="_blank" rel="noopener noreferrer">
          <img src="/x.png" alt="X logo" className="w-6 h-6" title={t("go_to_twitter")} />
        </a>
        <a href={telegram} target="_blank" rel="noopener noreferrer">
          <img src="/telegram.png" alt="telegram logo" className="w-6 h-6" title={t("go_to_telegram")} />
        </a>
        <a href={facebook} target="_blank" rel="noopener noreferrer">
          <img src="/facebook.png" alt="facebook logo" className="w-6 h-6" title={t("go_to_facebook")} />
        </a>
        <a href={thread} target="_blank" rel="noopener noreferrer">
          <img src="/thread.png" alt="thread logo" className="w-6 h-6" title={t("go_to_thread")} />
        </a>        
        <a href={discord} target="_blank" rel="noopener noreferrer">
          <img src="/discord.png" alt="discord logo" className="w-6 h-6" title={t("go_to_discord")} />
        </a>  
      </div>
    </div>
  );
};

export default LotteryDashboard;
