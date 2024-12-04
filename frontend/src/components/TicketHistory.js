import React, { useState, useEffect } from "react";
import useLotteryEvent from "../hooks/useLotteryEvent";
import TicketListTable from "./TicketListTable";
import RefundListTable from "./RefundListTable";
import WinnerListTable from "./WinnerListTable";
import RollingRecordTable from "./RollingRecordTable";
import { useTranslation } from "react-i18next";

const TicketHistory = () => {
  const { t, i18n } = useTranslation();
  const { allTickets, playerTickets, playerRefund, winnerList, rollingRecords} = useLotteryEvent();
  const [activeTab, setActiveTab] = useState("allTickets");
  const [activeData, setActiveData] = useState([]);

  useEffect(() => {
    let data = allTickets;

    if(activeTab === "myTickets")
      data = playerTickets;
    if(activeTab === "myRefund")
      data = playerRefund;
    if(activeTab === "winnerList")
      data = winnerList;
    if(activeTab === "rollingRecords")
      data = rollingRecords;

    setActiveData(data);
  }, [allTickets, playerTickets, playerRefund, winnerList, rollingRecords, activeTab]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg mr-2 ml-2">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab tab-bordered ${activeTab === "allTickets" ? "tab-active text-yellow-500" : ""}`}
          onClick={() => setActiveTab("allTickets")}
        >
          {t("all_tickets")}
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "myTickets" ? "tab-active text-yellow-500" : ""}`}
          onClick={() => setActiveTab("myTickets")}
        >
          {t("my_tickets")}
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "myRefund" ? "tab-active text-yellow-500" : ""}`}
          onClick={() => setActiveTab("myRefund")}
        >
          {t("my_refund")}
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "winnerList" ? "tab-active text-yellow-500" : ""}`}
          onClick={() => setActiveTab("winnerList")}
        >
          {t("winner_list")}
        </button>
        <button
          className={`tab tab-bordered ${activeTab === "rollingRecords" ? "tab-active text-yellow-500" : ""}`}
          onClick={() => setActiveTab("rollingRecords")}
        >
           {t("rolling_records")}
        </button>
      </div>

      {activeTab === "allTickets" && (
        <TicketListTable listData={allTickets} />
      )}
      {activeTab === "myTickets" && (
        <TicketListTable listData={playerTickets} />
      )}
      {activeTab === "myRefund" && (
        <RefundListTable listData={playerRefund} />
      )}
      {activeTab === "winnerList" && (
        <WinnerListTable listData={winnerList} />
      )}
      {activeTab === "rollingRecords" && (
        <RollingRecordTable listData={rollingRecords} />
      )}
    </div>
  );
};

export default TicketHistory;
