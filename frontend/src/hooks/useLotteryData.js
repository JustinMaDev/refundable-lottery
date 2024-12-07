import { useState, useEffect } from "react";
import {Contract, useWeb3} from '../contract';
import {ethers} from 'ethers';

function BigInt(num) {
  return ethers.BigNumber.from(num);
}
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
  const { account, provider, isConnected} = useWeb3();
  
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
  const [curRoundState, setCurRoundState] = useState("");
  const [stateTips, setStateTips] = useState("");
  

  const fetchRoundData = async () => {
    try {
      if (!provider || !isConnected) return;
      const lotteryContract = await Contract.RefundableLottery.getInstance(provider);

      const globalConfig = await lotteryContract.getGlobalConfig();
      const managmentFee = globalConfig[0];
      const priceInEther = globalConfig[1];
      const ticketNumberRange = globalConfig[2];
      const chipsPricePerEther = globalConfig[3];
      const chipsDiscount = globalConfig[4];
      const priceInChips = globalConfig[5];
      const maxParticipateRateInChips = globalConfig[6];
      const roundPeriod = globalConfig[7];
      //TODO roundNumber = globalConfig[9];

      //Get current round data
      const roundDetail = await lotteryContract.getRoundDetail(0);
      const roundInfo = roundDetail[0];
      const etherPurchaseCount = roundDetail[1];
      const chipsPurchaseCount = roundDetail[2];
      const holderEtherPurchaseCount = roundDetail[3];
      const holderChipsPurchaseCount = roundDetail[4];
      const roundEtherBalance = roundDetail[5];
      const roundChipsBalance = roundDetail[6];

      const roundNumber = await lotteryContract.roundNumber();
      const curBlockNumber = await provider.getBlockNumber();
      const averageBlockTime = await getAverageBlockTimeMs(provider, curBlockNumber, 10);
      let restSecond = 0;
      const endBlockNumber = roundInfo.startBlockNumber.add(roundPeriod);
      if(endBlockNumber.gt(curBlockNumber)){
        restSecond = endBlockNumber.sub(curBlockNumber).mul(averageBlockTime);
      }
      console.log("restSecond!!!:", restSecond.toString());
      const roundEther = ethers.utils.formatUnits(roundEtherBalance, 'ether');
      const roundChips = ethers.utils.formatUnits(roundChipsBalance, 'ether');
      const priceInChipsFormat = ethers.utils.formatUnits(priceInChips, 'ether');
      
      const curState = await lotteryContract.getCurRoundState();
      setCurRoundState(RoundState[curState]);
      setRoundNumber(roundNumber.toString());
      setStateTips(stateTipsMap[curState]);
      setCountdownDate(new Date().getTime() + Number(restSecond));
      setCountdownKey(roundNumber);
      setTicketCount(`${etherPurchaseCount.toString()} + ${chipsPurchaseCount.toString()}`);
      setPrizepool(`${roundEther}ETH+${ parseFloat(roundChips).toFixed(0)}CHIPS`);
      setTicketPriceInEther(`${ethers.utils.formatUnits(priceInEther.toString(), 'ether')}ETH`);
      setTicketPriceInChips(`${parseFloat(priceInChipsFormat).toFixed(0)}CHIPS`);
      
      setHolderEtherTickets(holderEtherPurchaseCount.toString());
      setHolderChipsTickets(holderChipsPurchaseCount.toString());
    } catch (error) {
      console.error("Error fetching lottery data:", error);
    }
  };
  useEffect(() => {
    const listenEvent = async () => {
      try {
        if (!provider || !isConnected) return;
        const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
        
        await lotteryContract.on(lotteryContract.filters.RoundStarted(), async () => {
          fetchRoundData();
        });
        await lotteryContract.on(lotteryContract.filters.LotteryRolling(), async () => {
          fetchRoundData();
        });
        await lotteryContract.on(lotteryContract.filters.LotteryDrawing(), async () => {
          fetchRoundData();
        });
        await lotteryContract.on("BuyTicket", async ()=>{
          fetchRoundData();
        });
      } catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    const pollNewBlocks = async () => {
      if (!provider || !isConnected) return;
      let latestBlock = await provider.getBlockNumber();
      const lotteryContract = await Contract.RefundableLottery.getInstance(provider);

      setInterval(async () => {
        const currentBlock = await provider.getBlockNumber();
        if (currentBlock > latestBlock) {
          const curState = await lotteryContract.getCurRoundState();
          if (curState !== curRoundState)
            setCurRoundState(RoundState[curState]);
          latestBlock = currentBlock;
        }
      }, 12000); //Poll every 12 seconds
    };

    fetchRoundData();
    listenEvent();
    pollNewBlocks();
  }, [provider, isConnected]);

  return { roundNumber, countdownKey, countdownDate, ticketCount, 
    prizepool, ticketPriceInEther, ticketPriceInChips, holderEtherTickets, 
    holderChipsTickets, curRoundState, stateTips, fetchRoundData };
};

export default useLotteryData;
