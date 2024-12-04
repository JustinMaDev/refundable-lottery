import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { Web3Wrapper } from "./contract";
import Navbar from "./components/Navbar";
import LotteryDashboard from "./components/LotteryDashboard";
import TicketHistory from "./components/TicketHistory";
function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  
  return (
    <Web3Wrapper>
    <div className="min-h-screen flex flex-col bg-gray-100">
      {showWelcome && (
        <div className="absolute inset-0 bg-gray-900 text-white flex flex-col items-center justify-center z-50">
          <h1 className="text-4xl font-bold mb-6">Welcome to the Game!</h1>
          <button
            className="btn btn-primary px-8 py-3 text-xl font-bold"
            onClick={() => setShowWelcome(false)}
          >
            Play
          </button>
        </div>
      )}
        
      <div className="bg-gray-800 text-white h-16 flex items-center px-6 shadow-lg">
        <Navbar />
      </div>

      <div className="flex flex-1 flex-col md:flex-row ">
        <div className="bg-gray-800 flex-[3] p-1">
          <LotteryDashboard />
        </div>
        <div className="bg-gray-800 flex-[5] p-1">
          <TicketHistory />
        </div>
      </div>
    </div>
    </Web3Wrapper>
  );
}

export default App;
