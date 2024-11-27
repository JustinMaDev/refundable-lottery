import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    const path = location.pathname;
    if (path === "/roles") {
      setActiveTab("roles");
    } else if (path === "/game") {
      setActiveTab("game");
    } else if (path === "/history") {
      setActiveTab("history");
    }
  }, [location]);

  return (
    <nav className="navbar">
      <div className="flex justify-around w-full">
        <Link
          to="/roles"
          className={`btn btn-ghost ${
            activeTab === "roles" ? "border-b-2 border-blue-500 text-blue-500" : ""
          }`}
          onClick={() => setActiveTab("roles")}
        >
          Rules
        </Link>

        <Link
          to="/game"
          className={`btn btn-ghost ${
            activeTab === "game" ? "border-b-2 border-blue-500 text-blue-500" : ""
          }`}
          onClick={() => setActiveTab("game")}
        >
          Play
        </Link>

        <Link
          to="/history"
          className={`btn btn-ghost ${
            activeTab === "history" ? "border-b-2 border-blue-500 text-blue-500" : ""
          }`}
          onClick={() => setActiveTab("history")}
        >
          History
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
