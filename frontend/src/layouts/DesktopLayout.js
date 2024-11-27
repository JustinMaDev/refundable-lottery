import React from "react";
import Rules from "../pages/Rules"; 
import Play from "../pages/Play"; 
import History from "../pages/History"; 

function DesktopLayout() {
  return (
    <div className="desktop-layout flex min-h-screen">
      <div className="left-panel w-1/3">
        <Rules />
      </div>
      <div className="center-panel w-1/3">
        <Play />
      </div>
      <div className="right-panel w-1/3">
        <History />
      </div>
    </div>
  );
}

export default DesktopLayout;
