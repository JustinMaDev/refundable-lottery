import { useEffect, useState } from "react";
import {Contract, useWeb3} from '../contract';
import {ethers} from 'ethers';

function shortenAddress(address, startLength = 6, endLength = 4) {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  const start = address.slice(0, startLength);
  const end = address.slice(-endLength);
  return `${start}...${end}`;
}

function formatBuyTicketEvent(event) {
  return {
    roundNumber: event.args.roundNumber.toString(),
    ticketNumber: event.args.ticketNumber.toString(),
    ticketNumberHex: `(0x${ethers.utils.hexlify(event.args.ticketNumber).slice(2).toUpperCase()})`,
    player: shortenAddress(event.args.player),
    amount: ethers.utils.formatUnits(event.args.amount, "ether")+ (event.args.inChips ? " Chips" : " ETH"),
    blockNumber: event.blockNumber.toString(),
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
    addrLink: Contract.NETWORK.blockExplorerAddress + event.args.player,
  };
}

function formatRefundEvent(event) {
  return {
    roundNumber: event.args.roundNumber.toString(),
    player: shortenAddress(event.args.player),
    refundAmount: ethers.utils.formatUnits(event.args.refundAmount, "ether") + (event.args.inChips ? " CHIP" : " ETH"),
    blockNumber: event.blockNumber.toString(),
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
    addrLink: Contract.NETWORK.blockExplorerAddress + event.args.player,
  };
}

function formatWinnerEvent(event) {
  const etherAmount = ethers.utils.formatUnits(event.args.etherAmount, "ether");
  const chipsAmount = ethers.utils.formatUnits(event.args.chipsAmount, "ether");
  return {
    roundNumber: event.args.roundNumber.toString(),
    jackpotNumber: "🥇" + event.args.jackpotNumber.toString(),
    jackpotNumberHex: `(0x${ethers.utils.hexlify(event.args.jackpotNumber).slice(2).toUpperCase()})`,
    winner: shortenAddress(event.args.winner),
    amount: `${etherAmount}ETH + ${chipsAmount}CHIP`,
    blockNumber: event.blockNumber.toString(),
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
    addrLink: Contract.NETWORK.blockExplorerAddress + event.args.winner,
  };
}

function formatRollingRecord(event) {
  return {
    roundNumber: event.args.roundNumber.toString(),
    requestId: shortenAddress(event.args.requestId.toString(), 4, 4),
    fullRequestId: event.args.requestId.toString(),
    chainlinkResult: shortenAddress(ethers.utils.hexlify(event.args.chainlinkResult), 4, 4),
    fullChainlinkResult: ethers.utils.hexlify(event.args.chainlinkResult),
    jackpotNumber: event.args.jackpotNumber.toString(),
    jackpotNumberHex: `(0x${ethers.utils.hexlify(event.args.jackpotNumber).slice(2).toUpperCase()})`,
    blockNumber: event.blockNumber.toString(),
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
  };
}

const PastEventsViewer = () => {
  const { account, provider, isConnected} = useWeb3();
  const [allTickets, setAllTickets] = useState([]);
  const [playerTickets, setPlayerTickets] = useState([]);
  const [playerRefund, setPlayerRefund] = useState([]);
  const [winnerList, setWinnerList] = useState([]);
  const [rollingRecords, setRollingRecords] = useState([]);

  useEffect(() => {
    if (!provider || !isConnected) return;

    const fetchAllTickets = async () => {
      try{
        const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
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
            if(event.args.player === account){
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
        const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
        await lotteryContract.on("LotteryDrawing", (roundNumber, requestId, chainlinkResult, jackpotNumber, event) => {
          const formattedEvent = formatRollingRecord(event);
          setRollingRecords((prevEvents) => [formattedEvent, ...prevEvents]);
        });
        await lotteryContract.on("Refund", (roundNumber, player, refundAmount, inChips, event) => {
          const formattedEvent = formatRefundEvent(event);
          setPlayerRefund((prevEvents) => [formattedEvent, ...prevEvents]);
        });
        await lotteryContract.on("DrawLottery", (roundNumber, jackpotNumber, winner, etherAmount, chipsAmount, event) => {
          
          console.log("DrawLottery!!!!!!!!!!!!!!!!!!!!!!!!!!!!", formattedEvent);
          
          const formattedEvent = formatWinnerEvent(event);
          setWinnerList((prevEvents) => [formattedEvent, ...prevEvents]);
        });
        await lotteryContract.on("BuyTicket", (roundNumber, player, ticketNumber, amount, inChips, event) => {
          const formattedEvent = formatBuyTicketEvent(event);
          setAllTickets((prevEvents) => [formattedEvent, ...prevEvents]);
          if(player == account){
            setPlayerTickets((prevEvents) => [formattedEvent, ...prevEvents]);
          }
        });
      } catch (error) {
        console.error("Error fetching rolling records:", error);
      }
    }

    fetchAllTickets();
    listen();
  }, [provider, isConnected]);

  return {allTickets, playerTickets, playerRefund, winnerList, rollingRecords};
};

export default PastEventsViewer;
