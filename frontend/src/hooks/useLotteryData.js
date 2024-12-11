import { useState, useEffect, useRef } from "react";
import { useWalletConnect } from '../contract';
import { toBigNumber, toEther } from '../utils';

async function getAverageBlockTimeMs(provider, startBlock, numBlocks) {
  try {
    let totalTime = 0;
    for (let i = startBlock; i > startBlock - numBlocks; i--) {
      const currentBlock = await provider.getBlock(i);
      const previousBlock = await provider.getBlock(i - 1);

      const timeDifference = currentBlock.timestamp - previousBlock.timestamp;
      totalTime += timeDifference;
    }

    const averageBlockTime = totalTime * 1000 / numBlocks;
    console.log(`Average Block Time: ${averageBlockTime} ms`);

    return averageBlockTime;
  } catch (error) {
    console.error("Error fetching block data:", error);
  }
}

const useLotteryData = () => {
  const { account, provider, isConnected, lotteryContract} = useWalletConnect();
  const pollNewBlocksID = useRef(null);

  const RoundState = ["Upcoming", "Playing", "ReadyToRoll", "Rolling", "ReadyToDraw", "Ended"];
  const stateTipsMap = [
    "UpcomingTips",
    "PlayingTips",
    "ReadyToRollTips",
    "RollingTips",
    "ReadyToDrawTips",
    "EndedTips"
  ];

  const [roundNumber, setRoundNumber] = useState("0");
  const [countdownKey, setCountdownKey] = useState(0);
  const [countdownDate, setCountdownDate] = useState(new Date().getTime());
  const [ticketCount, setTicketCount] = useState(0);
  const [prizepool, setPrizepool] = useState("");
  const [ticketPriceInEther, setTicketPriceInEther] = useState(0);
  const [ticketPriceInChips, setTicketPriceInChips] = useState(0);
  const [holderEtherTickets, setHolderEtherTickets] = useState(0);
  const [holderChipsTickets, setHolderChipsTickets] = useState(0);
  const [curRoundState, setCurRoundState] = useState("Upcoming");
  const [stateTips, setStateTips] = useState("UpcomingTips");
  const [ticketMaxNumber, setTicketMaxNumber] = useState(0);
  const [chipsDiscount, setChipsDiscount] = useState(0);

  let roundPeriod = toBigNumber(0);
  const fetchGlobalConfig = async () => {
    try {
      if (!provider || !isConnected) return;      
      const globalConfig = await lotteryContract.getGlobalConfig();
      //const managmentFee = globalConfig[0];
      const priceInEther = globalConfig[1];
      const ticketNumberRange = globalConfig[2];
      //const chipsPricePerEther = globalConfig[3];
      const chipsDiscountRate = globalConfig[4];
      const priceInChips = globalConfig[5];
      //const maxParticipateRateInChips = globalConfig[6];
      roundPeriod = globalConfig[7];
      
      setTicketPriceInEther(`${toEther(priceInEther)}ETH`);
      setTicketPriceInChips(`${toEther(priceInChips, 0)}CHIP`);
      setChipsDiscount(chipsDiscountRate);
      setTicketMaxNumber(ticketNumberRange);
    } catch (error) {
      console.error("Error fetching global config:", error);
    }
  };
  
  const fetchCurRoundData = async () => {
    try {
      if (!provider || !isConnected) return;
      //Get current round data
      const roundDetail = await lotteryContract.getRoundDetail(0);
      //const roundNumber = roundDetail.roundNumber;
      const roundInfo = roundDetail.info;
      const curState = roundDetail.realtimeState;

      const curBlockNumber = await provider.getBlockNumber();
      const averageBlockTime = await getAverageBlockTimeMs(provider, curBlockNumber, 10);
      let restSecond = 0;
      const endBlockNumber = roundInfo.startBlockNumber.add(roundPeriod);
      if(endBlockNumber.gt(curBlockNumber)){
        restSecond = endBlockNumber.sub(curBlockNumber).mul(averageBlockTime);
      }
      console.log("restSecond!!!:", restSecond.toString());
      const roundEther = toEther(roundDetail.roundEtherBalance);
      const roundChips = toEther(roundDetail.roundChipsBalance);
      
      setCurRoundState(RoundState[curState]);
      setRoundNumber(roundDetail.roundNumber.toString());
      setStateTips(stateTipsMap[curState]);
      setCountdownDate(new Date().getTime() + Number(restSecond));
      setCountdownKey(roundDetail.roundNumber);
      setTicketCount(`${roundDetail.etherPurchaseCount.toString()} + ${roundDetail.chipsPurchaseCount.toString()}`);
      setPrizepool(`${roundEther}ETH+${ parseFloat(roundChips).toFixed(0)}CHIP`);
      
      setHolderEtherTickets(roundDetail.playerEtherPurchaseCount.toString());
      setHolderChipsTickets(roundDetail.playerChipsPurchaseCount.toString());
    } catch (error) {
      console.error("Error fetching lottery data:", error);
    }
  };
  useEffect(() => {
    const listenEvent = async () => {
      try {
        if (!provider || !isConnected) return;
        
        await lotteryContract.on("RoundStarted", async () => {
          fetchCurRoundData();
        });
        await lotteryContract.on("LotteryRolling", async () => {
          fetchCurRoundData();
        });
        await lotteryContract.on("LotteryDrawing", async () => {
          fetchCurRoundData();
        });
        await lotteryContract.on("BuyTicket", async ()=>{
          fetchCurRoundData();
        });
      } catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    const pollNewBlocks = async () => {
      if (!provider || !isConnected) return;
      let latestBlock = await provider.getBlockNumber();

      pollNewBlocksID.current = setInterval(async () => {
        if (!provider || !isConnected) return;
        const currentBlock = await provider.getBlockNumber();
        if (currentBlock > latestBlock) {
          const curState = await lotteryContract.getCurRoundState();
          if (curState !== curRoundState)
            fetchCurRoundData();
          latestBlock = currentBlock;
        }
      }, 12000); //Poll every 12 seconds
    };

    if(isConnected && provider){
      fetchGlobalConfig();
      fetchCurRoundData();
      listenEvent();
      pollNewBlocks();
    }else{
      clearInterval(pollNewBlocksID.current);
      pollNewBlocksID.current = null;
    }
    
    return () => {
      clearInterval(pollNewBlocksID.current);
      pollNewBlocksID.current = null;
    };
  }, [provider, isConnected, account]);

  return { roundNumber, countdownKey, countdownDate, ticketCount, 
    prizepool, ticketPriceInEther, ticketPriceInChips, holderEtherTickets, 
    holderChipsTickets, curRoundState, stateTips, ticketMaxNumber, chipsDiscount };
};

export default useLotteryData;
