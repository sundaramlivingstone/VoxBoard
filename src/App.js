import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Whiteboard from "./components/Whiteboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/whiteboard/new" element={<Whiteboard />} />
        <Route path="/whiteboard/:projectId" element={<Whiteboard />} />
      </Routes>
    </Router>
  );
};

export default App;
