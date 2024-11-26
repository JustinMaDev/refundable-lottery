import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

function RulesPage() {
  return (
    <div className="rules-page">
      <h2>Rules</h2>
      <p>1. Role 1</p>
      <p>2. Role 2</p>
      <p>3. Role 3</p>
    </div>
  );
}

function GamePage() {
  return (
    <div className="game-page">
      <h2>Play</h2>
      <form>
        <div className="form-group">
          <label htmlFor="inputName">Name:</label>
          <input type="text" id="inputName" name="name" />
        </div>
        <div className="form-group">
          <label htmlFor="inputBet">Amount:</label>
          <input type="number" id="inputBet" name="bet" />
        </div>
        <button type="submit" className="btn">Buy</button>
      </form>
    </div>
  );
}

function HistoryPage() {
  return (
    <div className="history-page">
      <h2>History</h2>
      <ul>
        <li>Record 1</li>
        <li>Record 2</li>
        <li>Record 3</li>
      </ul>
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* Navigation, only shows in mobile phone */}
      <nav className="navbar">
        <Link to="/">Roles</Link>
        <Link to="/game">Play</Link>
        <Link to="/history">History</Link>
      </nav>

      <div className="desktop-layout">
        {/* PC screen layout */}
        <div className="left-panel">
          <RulesPage />
        </div>
        <div className="center-panel">
          <GamePage />
        </div>
        <div className="right-panel">
          <HistoryPage />
        </div>
      </div>

      {/* pages route */}
      <Routes>
        <Route path="/" element={<RulesPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
