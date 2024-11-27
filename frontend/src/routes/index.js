import React from "react";
import { Routes, Route } from "react-router-dom";
import Rules from "../pages/Rules";
import Play from "../pages/Play";
import History from "../pages/History";

function PathRouter() {
  return (
    <Routes>
      <Route path="/roles" element={<Rules />} />
      <Route path="/game" element={<Play />} />
      <Route path="/history" element={<History />} />
    </Routes>
  );
}

export default PathRouter;
