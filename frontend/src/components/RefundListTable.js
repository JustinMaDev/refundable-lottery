import React from "react";
import { useRef, useState } from "react";
import { Contract, useWalletConnect } from "../contract";
import { useTranslation } from "react-i18next";
import RuntimeErrorPortal from "./RuntimeErrorPortal";

const RefundListTable = ({ listData }) => {
  const { t, i18n } = useTranslation();
  const { account, provider, isConnected, lotteryContract } = useWalletConnect();
  const [roundNumber, setRoundNumber] = useState("");
  const runtimeErrorPortalRef = useRef();

  const handleRefund = async () => {
    if (!provider || !isConnected) return;
    console.log("Refunding round:", roundNumber);
    try {
      await lotteryContract.refund(parseInt(roundNumber));
    } catch (error) {
      runtimeErrorPortalRef.current.open(error);
    }
  };
  return (
  <div className="h-[calc(100vh-11rem)]">
    <div className="flex items-center space-x-4 mt-4">
      <input
        className="input input-bordered w-1/8"
        type="number"
        placeholder={t("enter_round_number")}
        value={roundNumber}
        onChange={(e) => setRoundNumber(e.target.value)}
      />
      <RuntimeErrorPortal ref={runtimeErrorPortalRef} />
      <button 
        className="btn btn-primary"
        onClick={handleRefund}
      >
        {t("refund")}
      </button>
    </div>
    <div className="overflow-x-auto mt-4">
      <table className="table w-full">
        <thead>
          <tr>
            <th>{t("round")}</th>
            <th>{t("player")}</th>
            <th>{t("refund_amount")}</th>
            <th>{t("block_number")}</th>
          </tr>
        </thead>
        <tbody>
          {listData.map((item, index) => (
            <tr key={index}>
              <td>{item.roundNumber}</td>
              <td><a
                  href={item.addrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500"
                >
                  {item.player}
                </a></td>
              <td>{item.refundAmount}</td>
              <td>
                <a
                  href={item.txLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500"
                >
                  {item.blockNumber}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default RefundListTable;
