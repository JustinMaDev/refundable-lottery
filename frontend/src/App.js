import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { WalletConnectWrapper } from "./contract";
import Navbar from "./components/Navbar";
import LotteryDashboard from "./components/LotteryDashboard";
import TicketHistory from "./components/TicketHistory";
import { useTranslation } from "react-i18next";

function App() {
  const { t, i18n } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
  
  return (
    <WalletConnectWrapper>
    <div className="min-h-screen flex flex-col bg-gray-100">
      {showWelcome && (
        <div className="absolute inset-0 bg-gray-900 text-white flex flex-col items-center justify-center z-50">
          <h1 className="text-4xl font-bold mb-6">{t('welcome')}</h1>
          <button
            className="btn btn-primary px-8 py-3 text-xl font-bold"
            onClick={() => setShowWelcome(false)}
          >
            {t('play')}
          </button>
        </div>
      )}
        
      <div className="bg-gray-800 text-white h-16 flex items-center px-6 shadow-lg">
        <Navbar />
      </div>

      <div className="flex flex-1 flex-col md:flex-row ">
        <div className="bg-gray-800 min-h-screen flex-[3] p-1">
          <LotteryDashboard />
        </div>
        <div className="bg-gray-800 min-h-screen flex-[5] p-1">
          <TicketHistory />
        </div>
      </div>
    </div>
    </WalletConnectWrapper>
  );
}

export default App;
