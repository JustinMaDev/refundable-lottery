import { useState, useEffect } from "react";
import {Contract, useWeb3} from '../contract';
import web3 from 'web3';

async function getAverageBlockTime(provider, startBlock, numBlocks) {
  try {
    let totalTime = web3.utils.toBigInt(0);
    for (let i = startBlock; i > startBlock - numBlocks; i--) {
      const currentBlock = await provider.eth.getBlock(i);
      const previousBlock = await provider.eth.getBlock(i - web3.utils.toBigInt(1));

      const timeDifference = currentBlock.timestamp - previousBlock.timestamp;
      totalTime += timeDifference;
    }

    const averageBlockTime = totalTime / numBlocks;
    console.log(`Average Block Time: ${averageBlockTime} seconds`);

    return averageBlockTime;
  } catch (error) {
    console.error("Error fetching block data:", error);
  }
}
const useLotteryData = () => {
    const { account, provider, isConnected} = useWeb3();
    
    const RoundState = ["Upcoming", "Playing", "ReadyToRoll", "Rolling", "ReadyToDraw", "Ended"];
    const stateTipsMap = [
      "Current round is not started yet. Please wait for the round to start.",
      "Current round is playing. You can buy tickets using ETH or CHIPS.",
      "You can click this button and roll the dice, and you will get Chips as reward.",
      "Current round is rolling. Plesae wait for the result.",
      "You can click this button and draw the lottery for winner(s), and you will get Chips as reward.",
      "Current round is ended. Please wait for next round."
    ];

    const [roundBtnText, setRoundBtnText] = useState("Round:");
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
    

  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        if (!provider || !isConnected) return;
        const lotteryContract = await Contract.RefundableLottery.getInstance(provider);

        const priceInEther = await lotteryContract.methods.TICKET_PRICE_IN_ETHER().call();
        const chipsPricePerEther = await lotteryContract.methods.CHIPS_PRICE_PER_ETHER().call();
        const priceInChips = priceInEther * chipsPricePerEther;
        const chipsDiscount = await lotteryContract.methods.DISCOUNT_RATE().call();

        const roundNumber = await lotteryContract.methods.roundNumber().call();
        const roundPeriod = await lotteryContract.methods.ROUND_PERIOD().call();
        const roundInfo = await lotteryContract.methods.roundInfos(roundNumber).call();
        const curBlockNumber = await provider.eth.getBlockNumber();
        const averageBlockTime = await getAverageBlockTime(provider, curBlockNumber, web3.utils.toBigInt(10));
        const restSecond = (roundInfo.startBlockNumber + roundPeriod - curBlockNumber)*averageBlockTime;
        const etherTicketsCount = await lotteryContract.methods.etherPurchaseCount(roundNumber).call();
        const chipsTicketsCount = await lotteryContract.methods.chipsPurchaseCount(roundNumber).call();
        
        const roundEtherBalance = await lotteryContract.methods.roundEtherBalance(roundNumber).call();
        const roundChipsBalance = await lotteryContract.methods.roundChipsBalance(roundNumber).call();
        //to ether
        const roundEther = web3.utils.fromWei(roundEtherBalance, 'ether');
        const roundChips = web3.utils.fromWei(roundChipsBalance, 'ether');

        const curState = await lotteryContract.methods.getCurRoundState().call();
        setCurRoundState(RoundState[curState]);
        setRoundBtnText(`Round ${roundNumber}: ${RoundState[curState]}`);
        setStateTips(stateTipsMap[curState]);
        setCountdownDate(new Date().getTime() + Number(restSecond)*1000);
        setCountdownKey(countdownKey+1);
        setTicketCount(Number(etherTicketsCount + chipsTicketsCount));
        setPrizepool(`${roundEther}ETH+${roundChips}CHIPS`);
        setTicketPriceInEther(`${web3.utils.fromWei(priceInEther, 'ether')}ETH`);
        setTicketPriceInChips(`${web3.utils.fromWei(priceInChips, 'ether')}CHIPS`);
        
        console.log("holder ether tickets:", await lotteryContract.methods.holderEtherPurchaseCount(roundNumber, account).call());
        setHolderEtherTickets((await lotteryContract.methods.holderEtherPurchaseCount(roundNumber, account).call()).toString());
        setHolderChipsTickets((await lotteryContract.methods.holderChipsPurchaseCount(roundNumber, account).call()).toString());
        
        console.log("Round number:", roundNumber);
      } catch (error) {
        console.error("Error fetching lottery data:", error);
      }
    };

    const listenEvent = async () => {
      try {
        if (!provider || !isConnected) return;
        const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
        lotteryContract.events.RoundStarted()
          .on("data", (event) => {
            fetchRoundData();
          });
        lotteryContract.events.RoundEnded()
          .on("data", (event) => {
            fetchRoundData();
          });
        lotteryContract.events.LotteryRolling()
          .on("data", (event) => {
            fetchRoundData();
          });
        lotteryContract.events.LotteryDrawing()
          .on("data", (event) => {
            fetchRoundData();
          });
        lotteryContract.events.BuyTicket()
          .on("data", (event) => {
            fetchRoundData();
          });
      } catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    const pollNewBlocks = async () => {
      if (!provider || !isConnected) return;
      let latestBlock = await provider.eth.getBlockNumber();
      const lotteryContract = await Contract.RefundableLottery.getInstance(provider);

      setInterval(async () => {
        const currentBlock = await provider.eth.getBlockNumber();
        if (currentBlock > latestBlock) {
          console.log("New block detected:", currentBlock);
          const curState = await lotteryContract.methods.getCurRoundState().call();
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

  return { roundBtnText, countdownKey, countdownDate, ticketCount, 
    prizepool, ticketPriceInEther, ticketPriceInChips, holderEtherTickets, 
    holderChipsTickets, curRoundState, stateTips };
};

export default useLotteryData;
