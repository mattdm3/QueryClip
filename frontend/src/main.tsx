import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import App from "./App";
import { AppContextProvider } from "./context";

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>
);
