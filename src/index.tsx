import React from "react";
import ReactDOM from "react-dom/client";

// Components
import App from "./App";

// Styling
import "./css/index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
