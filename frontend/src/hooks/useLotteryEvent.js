import { useEffect, useState } from "react";
import {Contract, useWalletConnect} from '../contract';
import { toHex, toEther, shortenString } from '../utils';

function formatBuyTicketEvent(event) {
  return {
    roundNumber: event.args.roundNumber.toString(),
    ticketNumber: event.args.ticketNumber.toString(),
    ticketNumberHex: `(0x${toHex(event.args.ticketNumber).slice(2).toUpperCase()})`,
    player: shortenString(event.args.player),
    amount: toEther(event.args.amount)+ (event.args.inChips ? " Chips" : " ETH"),
    blockNumber: event.blockNumber.toString(),
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
    addrLink: Contract.NETWORK.blockExplorerAddress + event.args.player,
  };
}

function formatRefundEvent(event) {
  const refundEtherAmount = toEther(event.args.refundEtherAmount);
  const refundChipsAmount = toEther(event.args.refundChipsAmount);
  return {
    roundNumber: event.args.roundNumber.toString(),
    player: shortenString(event.args.player),
    refundAmount: `${refundEtherAmount}ETH + ${refundChipsAmount}CHIP`,
    blockNumber: event.blockNumber.toString(),
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
    addrLink: Contract.NETWORK.blockExplorerAddress + event.args.player,
  };
}

function formatWinnerEvent(event) {
  const etherAmount = toEther(event.args.etherAmount);
  const chipsAmount = toEther(event.args.chipsAmount);
  return {
    roundNumber: event.args.roundNumber.toString(),
    jackpotNumber: "🥇" + event.args.jackpotNumber.toString(),
    jackpotNumberHex: `(0x${toHex(event.args.jackpotNumber).slice(2).toUpperCase()})`,
    winner: shortenString(event.args.winner),
    amount: `${etherAmount}ETH + ${chipsAmount}CHIP`,
    blockNumber: event.blockNumber.toString(),
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
    addrLink: Contract.NETWORK.blockExplorerAddress + event.args.winner,
  };
}

function formatRollingRecord(event) {
  return {
    roundNumber: event.args.roundNumber.toString(),
    requestId: shortenString(event.args.requestId.toString(), 4, 4),
    fullRequestId: event.args.requestId.toString(),
    chainlinkResult: shortenString(toHex(event.args.chainlinkResult), 4, 4),
    fullChainlinkResult: toHex(event.args.chainlinkResult),
    jackpotNumber: event.args.jackpotNumber.toString(),
    jackpotNumberHex: `(0x${toHex(event.args.jackpotNumber).slice(2).toUpperCase()})`,
    blockNumber: event.blockNumber.toString(),
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
  };
}

const useLotteryEvent = () => {
  const { account, provider, isConnected, lotteryContract} = useWalletConnect();
  const [allTickets, setAllTickets] = useState([]);
  const [playerTickets, setPlayerTickets] = useState([]);
  const [playerRefund, setPlayerRefund] = useState([]);
  const [winnerList, setWinnerList] = useState([]);
  const [rollingRecords, setRollingRecords] = useState([]);

  useEffect(() => {
    const fetchAllTickets = async () => {
      try{
        let filter = lotteryContract.filters.LotteryDrawing();
        const rollingRecords = await lotteryContract.queryFilter(filter);
        const formatedEvents = rollingRecords.reverse().map((event) => {
          return formatRollingRecord(event);
        });
        setRollingRecords(formatedEvents);

        filter = lotteryContract.filters.BuyTicket();
        const allBuyTicketEvents = await lotteryContract.queryFilter(filter);
        const playerTickets = [];
        const allTickets = await Promise.all(
          allBuyTicketEvents.reverse().map(async (event) => {
            const formattedEvent = formatBuyTicketEvent(event);
            if(event.args.player.toUpperCase() === account.toUpperCase()){
              playerTickets.push(formattedEvent);
            }
            return formattedEvent;
          })
        );
        setAllTickets(allTickets);
        setPlayerTickets(playerTickets);

        filter = lotteryContract.filters.DrawLottery();
        const winnerList = await lotteryContract.queryFilter(filter);
        const formattedEvents = winnerList.reverse().map((event) => formatWinnerEvent(event));
        setWinnerList(formattedEvents);

        filter = lotteryContract.filters.Refund(null, account);
        const curPlayerRefundEvents = await lotteryContract.queryFilter(filter);
        setPlayerRefund(curPlayerRefundEvents.reverse().map((event) => formatRefundEvent(event)));
      }catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    async function listen(){
      try {
        await lotteryContract.on("LotteryDrawing", (roundNumber, requestId, chainlinkResult, jackpotNumber, event) => {
          const formattedEvent = formatRollingRecord(event);
          setRollingRecords((prevEvents) => [formattedEvent, ...prevEvents]);
        });
        await lotteryContract.on("Refund", (roundNumber, player, refundEtherAmount, refundChipsAmount, event) => {
          const formattedEvent = formatRefundEvent(event);
          setPlayerRefund((prevEvents) => [formattedEvent, ...prevEvents]);
        });
        await lotteryContract.on("DrawLottery", (roundNumber, jackpotNumber, winner, etherAmount, chipsAmount, event) => {
          const formattedEvent = formatWinnerEvent(event);
          setWinnerList((prevEvents) => [formattedEvent, ...prevEvents]);
        });
        await lotteryContract.on("BuyTicket", (roundNumber, player, ticketNumber, amount, inChips, event) => {
          const formattedEvent = formatBuyTicketEvent(event);
          setAllTickets((prevEvents) => [formattedEvent, ...prevEvents]);
          if(player.toUpperCase() == account.toUpperCase()){
            setPlayerTickets((prevEvents) => [formattedEvent, ...prevEvents]);
          }
        });
      } catch (error) {
        console.error("Error fetching rolling records:", error);
      }
    }

    
    if (isConnected && provider) {
      fetchAllTickets();
      listen();
    }else{
      setAllTickets([]);
      setPlayerTickets([]);
      setPlayerRefund([]);
      setWinnerList([]);
      setRollingRecords([]);
    }
  }, [provider, isConnected]);

  return {allTickets, playerTickets, playerRefund, winnerList, rollingRecords};
};

export default useLotteryEvent;
