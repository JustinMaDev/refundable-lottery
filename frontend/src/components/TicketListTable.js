import React from "react";
import { useTranslation } from "react-i18next";

const TicketListTable = ({ listData }) => {
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto mt-4 h-[calc(100vh-11rem)]">
      <table className="table w-full">
        <thead>
          <tr>
            <th>{t("round")}</th>
            <th>{t("ticket_number")}</th>
            <th>{t("player")}</th>
            <th>{t("costs")}</th>
            <th>{t("block_number")}</th>
          </tr>
        </thead>
        <tbody>
          {listData.map((item, index) => (
            <tr key={index}>
              <td>{item.roundNumber}</td>
              <td>
                <span>{item.ticketNumber}</span>
                <span className="text-gray-500 ml-1">{item.ticketNumberHex}</span>
              </td>
              <td><a
                  href={item.addrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500"
                >
                  {item.player}
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

export default TicketListTable;
