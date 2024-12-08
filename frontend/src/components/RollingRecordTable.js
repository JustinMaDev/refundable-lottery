import React from "react";
import { useEffect, useState } from "react";
import { Contract, useWalletConnect } from "../contract";
import { useTranslation } from "react-i18next";

const RollingRecordTable = ({ listData }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="overflow-x-auto mt-4 h-[calc(100vh-11rem)]">
      <table className="table w-full">
        <thead>
          <tr>
            <th>{t("round")}</th>
            <th>{t("request_id")}</th>
            <th>{t("chainlink_result")}</th>
            <th>{t("jackpot_number")}</th>
            <th>{t("block_number")}</th>
          </tr>
        </thead>
        <tbody>
          {listData.map((item, index) => (
            <tr key={index}>
              <td>{item.roundNumber}</td>
              <td>{item.requestId}</td>
              <td>{item.chainlinkResult}</td>
              <td>
                <span>{item.jackpotNumber}</span>
                <span className="text-gray-500 ml-1">{item.jackpotNumberHex}</span>
              </td>
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

export default RollingRecordTable;
