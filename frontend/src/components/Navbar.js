import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {Contract, useWeb3} from '../contract';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function Navbar() {
  const { t, i18n } = useTranslation();
  const { chainId, account, provider, isConnected, connect, disconnect } = useWeb3();
  
  const github = "https://github.com";
  const blockchainExplorer = "https://bscscan.com";
  const twitter = "https://x.com";
  const telegram = "https://t.me";
  const facebook = "https://facebook.com";
  const thread = "https://thread.com";
  const discord = "https://discord.com";

  useEffect(() => {
    if (account) {
      console.log("Account updated: ", account);
    }
  }, [account]);

  const handleConnectWallet = async () => {
    connect();
  };

  return (
    <div className="navbar px-4 shadow-md">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/chips.png" alt="Logo" className="w-10 h-10" />
        <span className="ml-2 mr-4 text-xl font-semibold">{t("refundable_lottery")}</span>
        <a href={github} target="_blank" rel="noopener noreferrer">
          <img src="/github-mark-white.png" alt="Github" className="w-6 h-6 mr-4" title={t("go_to_github")} />
        </a>
        <a href={blockchainExplorer} target="_blank" rel="noopener noreferrer">
          <img src="/blockchain_explorer.png" alt="Blockchain Explorer" className="w-6 h-6 mr-4" title={t("go_to_blockchain_explorer")} />
        </a>
        <a href={twitter} target="_blank" rel="noopener noreferrer">
          <img src="/x.png" alt="X logo" className="w-6 h-6 mr-4" title={t("go_to_twitter")} />
        </a>
        <a href={telegram} target="_blank" rel="noopener noreferrer">
          <img src="/telegram.png" alt="telegram logo" className="w-6 h-6 mr-4" title={t("go_to_telegram")} />
        </a>
        <a href={facebook} target="_blank" rel="noopener noreferrer">
          <img src="/facebook.png" alt="facebook logo" className="w-6 h-6 mr-4" title={t("go_to_facebook")} />
        </a>
        <a href={thread} target="_blank" rel="noopener noreferrer">
          <img src="/thread.png" alt="thread logo" className="w-6 h-6 mr-4" title={t("go_to_thread")} />
        </a>        
        <a href={discord} target="_blank" rel="noopener noreferrer">
          <img src="/discord.png" alt="discord logo" className="w-6 h-6 mr-4" title={t("go_to_discord")} />
        </a>       
      </div>

      {/* Connect Wallet Button */}
      <div className="ml-auto">
        {isConnected ? (
          <span className="ext-primary cursor-pointer text-lg font-medium">
            {t("wallet_connected")}
          </span>
        ) : (
          <span
            className="text-primary cursor-pointer text-lg font-medium hover:underline"
            onClick={handleConnectWallet}
          >
            {t("connect_wallet")}
          </span>
        )}
      </div>
      <LanguageSwitcher className="ml-4" />
    </div>
  );
}

export default Navbar;
