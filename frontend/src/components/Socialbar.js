import React from 'react';
import { Contract } from '../contract';
import { useTranslation } from 'react-i18next';
const Socialbar = () => {
  const {t} = useTranslation();
  const github = "https://github.com/JustinMaDev/refundable-lottery";
  const lotteryContractLink = Contract.NETWORK?.blockExplorerAddress + Contract.RefundableLottery?.address;
  const chipsContractLink = Contract.NETWORK?.blockExplorerAddress + Contract.ChipsToken?.address;
  const twitter = "https://x.com/hashtag/RefundableLottery";
  const telegram = "https://t.me/refundable_lottery";
  const facebook = "https://facebook.com";
  const thread = "https://thread.com";
  const discord = "https://discord.com";

  return (
    <div className="flex flex-wrap justify-evenly items-center mt-16 gap-4 w-full">
        <a href={github} target="_blank" rel="noopener noreferrer">
          <img src="/github-mark-white.png" alt="Github" className="w-6 h-6 " title={t("go_to_github")} />
        </a>
        <a href={lotteryContractLink} target="_blank" rel="noopener noreferrer">
          <img src="/blockchain_explorer.png" alt="Blockchain Explorer" className="w-6 h-6 " title={t("go_to_blockchain_explorer")} />
        </a>
        <a href={chipsContractLink} target="_blank" rel="noopener noreferrer">
          <img src="/chips-logo.svg" alt="Blockchain Explorer" className="w-6 h-6 " title={t("go_to_blockchain_explorer")} />
        </a>
        <a href={twitter} target="_blank" rel="noopener noreferrer">
          <img src="/x.png" alt="X logo" className="w-6 h-6" title={t("go_to_twitter")} />
        </a>
        <a href={telegram} target="_blank" rel="noopener noreferrer">
          <img src="/telegram.png" alt="telegram logo" className="w-6 h-6" title={t("go_to_telegram")} />
        </a>
        {/*<a href={facebook} target="_blank" rel="noopener noreferrer">
          <img src="/facebook.png" alt="facebook logo" className="w-6 h-6" title={t("go_to_facebook")} />
        </a>
        <a href={thread} target="_blank" rel="noopener noreferrer">
          <img src="/thread.png" alt="thread logo" className="w-6 h-6" title={t("go_to_thread")} />
        </a>        
        <a href={discord} target="_blank" rel="noopener noreferrer">
          <img src="/discord.png" alt="discord logo" className="w-6 h-6" title={t("go_to_discord")} />
        </a> */}
    </div>
  );
};

export default Socialbar;
