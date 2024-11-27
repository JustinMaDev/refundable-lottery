import React from "react";
import { Routes, Route } from "react-router-dom";
import Rules from "../pages/Rules"; 
import Play from "../pages/Play"; 
import History from "../pages/History"; 
import Navbar from "../components/Navbar";

function MobileLayout() {
  return (
    <div className="mobile-layout flex flex-col min-h-screen">
      <div className="page-layout flex-grow " >
        <Routes>
          <Route path="/roles" element={<Rules />} />
          <Route path="/game" element={<Play />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
      <div className="nav-layout">
        <Navbar />
      </div>
    </div>
  );
}

export default MobileLayout;
