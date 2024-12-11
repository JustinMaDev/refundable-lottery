import React from "react";
import "./App.css";
import { WalletConnectWrapper } from "./contract";
import Navbar from "./components/Navbar";
import LotteryDashboard from "./components/LotteryDashboard";
import TicketHistory from "./components/TicketHistory";
import  WelcomePage  from "./components/WelcomePage";
function App() {  
  return (
    <WalletConnectWrapper>
    <div className="min-h-screen flex flex-col bg-gray-100">
      <WelcomePage />
        
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
