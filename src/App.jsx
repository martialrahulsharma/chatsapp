import React from "react";
import MyRouter from "./component/router/MyRouter";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <Router>
      <MyRouter />
    </Router>
  );
}

export default App;
