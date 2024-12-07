import React from "react";
import { useEffect, useState } from "react";
import { Contract, useWeb3 } from "../contract";
import { useTranslation } from "react-i18next";

const WinnerListTable = ({ listData }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="overflow-x-auto mt-4 h-[calc(100vh-11rem)]">
      <table className="table w-full">
        <thead>
          <tr>
            <th>{t("round")}</th>
            <th>{t("jackpot_number")}</th>
            <th>{t("winner")}</th>
            <th>{t("prize_amount")}</th>
            <th>{t("block_number")}</th>
          </tr>
        </thead>
        <tbody>
          {listData.map((item, index) => (
            <tr key={index}>
              <td>{item.roundNumber}</td>
              <td>
                <span>{item.jackpotNumber}</span>
                <span className="text-gray-500 ml-1">{item.jackpotNumberHex}</span>
              </td>
              <td><a
                  href={item.addrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500"
                >
                  {item.winner}
                </a></td>
              <td>{item.amount}</td>
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
  );
};

export default WinnerListTable;
