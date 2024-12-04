import React from "react";
import { useEffect, useState } from "react";
import { Contract, useWeb3 } from "../contract";
import { useTranslation } from "react-i18next";

const RefundListTable = ({ listData }) => {
  const { t, i18n } = useTranslation();
  const { account, provider, isConnected } = useWeb3();
  const [roundNumber, setRoundNumber] = useState("");

  const handleRefund = async () => {
    if (!provider || !isConnected) return;
    console.log("Refunding round:", roundNumber);
    const lotteryContract = await Contract.RefundableLottery.getInstance(provider);
    try {
      await lotteryContract.methods.refund(parseInt(roundNumber)).send({ from: account });
    } catch (error) {
      console.error("Failed to refund:", error);
    }
  };
  return (
  <>
    <div className="flex items-center space-x-4 mt-4">
      <input
        className="input input-bordered w-1/8"
        type="number"
        placeholder={t("enter_round_number")}
        value={roundNumber}
        onChange={(e) => setRoundNumber(e.target.value)}
      />
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
  </>
  );
};

export default RefundListTable;
