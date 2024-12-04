import { useEffect, useState } from "react";
import {Contract, useWeb3} from '../contract';
import web3 from 'web3';

function shortenAddress(address, startLength = 6, endLength = 4) {
  if (!address || address.length < startLength + endLength) {
    return address;
  }
  const start = address.slice(0, startLength);
  const end = address.slice(-endLength);
  return `${start}...${end}`;
}

async function formatBuyTicketEvent(event, lotteryContract) {
  const roundEndedEvent = await lotteryContract.getPastEvents("RoundEnded", {
    filter: { roundNumber: event.returnValues.roundNumber },
    fromBlock: Contract.RefundableLottery.creationBlockNumber,
    toBlock: "latest",
  });
  const isJackpot = roundEndedEvent.length > 0 && roundEndedEvent[0].returnValues.jackpotNumber === event.returnValues.ticketNumber;
  
  return {
    roundNumber: event.returnValues.roundNumber.toString(),
    ticketNumber: (isJackpot ? "🥇" : "") + event.returnValues.ticketNumber.toString(),
    ticketNumberHex: `(0x${web3.utils.toHex(event.returnValues.ticketNumber).slice(2).toUpperCase()})`,
    player: shortenAddress(event.returnValues.player),
    amount: web3.utils.fromWei(event.returnValues.amount, "ether")+ (event.returnValues.inChips ? " Chips" : " ETH"),
    blockNumber: event.blockNumber.toString(),
    timestamp: event.returnValues.timestamp,
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
    addrLink: Contract.NETWORK.blockExplorerAddress + event.returnValues.player,
  };
}

function formatRefundEvent(event) {
  console.log("Refund event format:", event.returnValues.timestamp);
  return {
    roundNumber: event.returnValues.roundNumber.toString(),
    player: shortenAddress(event.returnValues.player),
    refundAmount: web3.utils.fromWei(event.returnValues.refundAmount, "ether") + (event.returnValues.inChips ? " Chips" : " ETH"),
    blockNumber: event.blockNumber.toString(),
    timestamp: event.returnValues.timestamp,
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
    addrLink: Contract.NETWORK.blockExplorerAddress + event.returnValues.player,
  };
}

function formatWinnerEvent(event) {
  return {
    roundNumber: event.returnValues.roundNumber.toString(),
    jackpotNumber: event.returnValues.jackpotNum.toString(), //TODO: jackpotNum => jackpotNumber
    jackpotNumberHex: `(0x${web3.utils.toHex(event.returnValues.jackpotNum).slice(2).toUpperCase()})`,
    winner: shortenAddress(event.returnValues.winner),
    amount: web3.utils.fromWei(event.returnValues.amount, "ether") + (event.returnValues.inChips ? " Chips" : " ETH"),
    blockNumber: event.blockNumber.toString(),
    txLink: Contract.NETWORK.blockExplorerTx + event.transactionHash,
    addrLink: Contract.NETWORK.blockExplorerAddress + event.returnValues.winner,
  };
}

function formatRollingRecord(event) {
  return {
    roundNumber: event.returnValues.roundNumber.toString(),
    requestId: shortenAddress(event.returnValues.requestId.toString(), 4, 4),
    fullRequestId: event.returnValues.requestId.toString(),
    chainlinkResult: shortenAddress(web3.utils.toHex(event.returnValues.chainlinkResult), 4, 4),
    fullChainlinkResult: web3.utils.toHex(event.returnValues.chainlinkResult),
    jackpotNumber: event.returnValues.jackpotNumber.toString(),
    jackpotNumberHex: `(0x${web3.utils.toHex(event.returnValues.jackpotNumber).slice(2).toUpperCase()})`,
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
        const allBuyTicketEvents = await lotteryContract.getPastEvents("BuyTicket", {
          fromBlock: Contract.RefundableLottery.creationBlockNumber,
          toBlock: "latest",
        });
        
        const formattedEvents = await Promise.all(
          allBuyTicketEvents.reverse().map(async (event) => {
            return await formatBuyTicketEvent(event, lotteryContract);
          })
        );
        setAllTickets(formattedEvents);

        lotteryContract.events.BuyTicket()
          .on("data", async (event) => {
            const formattedEvent = await formatBuyTicketEvent(event, lotteryContract);
            setAllTickets((prevEvents) => [formattedEvent, ...prevEvents]);
          });
      }catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    const fetchPlayerTockets = async () => {
      try {
        const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
        const curPlayerBuyTicketEvents = await lotteryContract.getPastEvents("BuyTicket", {
          filter: { player: account},
          fromBlock:Contract.RefundableLottery.creationBlockNumber,
          toBlock: "latest",
        });
        const formattedEvents = await Promise.all(
          curPlayerBuyTicketEvents.reverse().map(async (event) => {
            return await formatBuyTicketEvent(event, lotteryContract);
          })
        );
        console.log("Player tickets:", formattedEvents); 
        setPlayerTickets(formattedEvents);

        lotteryContract.events.BuyTicket()
          .on("data", async (event) => {
            if (event.returnValues.player === account) {
              const formattedEvent = await formatBuyTicketEvent(event, lotteryContract);
              setPlayerTickets((prevEvents) => [formattedEvent, ...prevEvents]);
            }
          });
      } catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    const fetchPlayerRefund = async () => {
      try {
        const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
        const curPlayerRefundEvents = await lotteryContract.getPastEvents("Refund", {
          filter: { player: account},
          fromBlock:Contract.RefundableLottery.creationBlockNumber,
          toBlock: "latest",
        });
        setPlayerRefund(curPlayerRefundEvents.reverse().map((event) => formatRefundEvent(event)));

        lotteryContract.events.Refund()
          .on("data", (event) => {
            if (event.returnValues.player !== account) return;
            const formattedEvent = formatRefundEvent(event);
            setPlayerRefund((prevEvents) => [formattedEvent, ...prevEvents]);
          });
      } catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    async function fetchWinnerList() {
      try {
        const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
        const winnerList = await lotteryContract.getPastEvents("DrawLottory", {
          fromBlock: Contract.RefundableLottery.creationBlockNumber,
          toBlock: "latest",
        });
        const formattedEvents = winnerList.reverse().map((event) => formatWinnerEvent(event));
        setWinnerList(formattedEvents);

        lotteryContract.events.DrawLottory()
          .on("data", (event) => {
            const formattedEvent = formatWinnerEvent(event);
            setWinnerList((prevEvents) => [formattedEvent, ...prevEvents]);
          });
      } catch (error) {
        console.error("Error fetching winner list:", error);
      }
    }

    async function fetchRollingRecords(){
      try {
        const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
        const rollingRecords = await lotteryContract.getPastEvents("LotteryDrawing", {
          fromBlock: Contract.RefundableLottery.creationBlockNumber,
          toBlock: "latest",
        });
        
        const formatedEvents = rollingRecords.reverse().map((event) => formatRollingRecord(event));
        setRollingRecords(formatedEvents);

        lotteryContract.events.LotteryDrawing()
          .on("data", (event) => {
            const formattedEvent = formatRollingRecord(event);
            setRollingRecords((prevEvents) => [formattedEvent, ...prevEvents]);
          });
      } catch (error) {
        console.error("Error fetching rolling records:", error);
      }
    }

    fetchAllTickets();
    fetchPlayerTockets();
    fetchPlayerRefund();
    fetchWinnerList();
    fetchRollingRecords();
  }, [provider, isConnected]);

  return {allTickets, playerTickets, playerRefund, winnerList, rollingRecords};
};

export default PastEventsViewer;
