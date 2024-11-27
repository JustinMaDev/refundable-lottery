import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import DesktopLayout from "./layouts/DesktopLayout";
import MobileLayout from "./layouts/MobileLayout";

function App() {
  return (
    <Router>
        <div className="block md:hidden">
          <MobileLayout />
        </div>

        <div className="hidden md:block">
          <DesktopLayout />
        </div>
    </Router>
  );
}

export default App;
