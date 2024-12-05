import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {Contract, useWeb3} from '../contract';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function Navbar() {
  const { t, i18n } = useTranslation();
  const { chainId, account, provider, isConnected, connect, disconnect } = useWeb3();
  


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
