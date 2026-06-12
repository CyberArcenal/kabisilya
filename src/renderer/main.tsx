// main.tsx placeholder
import ReactDOM from "react-dom/client";
import "./styles/App.css";
import "./styles/App-dark.css";
import "./styles/scrollbar.css";
import "reflect-metadata";
import React from "react";
import ConditionalRouter from "./components/Shared/ConditionalRouter";
import App from "./routes/App";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ThemeProvider } from "./contexts/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsProvider>
      <ThemeProvider>
        <ConditionalRouter>
          <App />
        </ConditionalRouter>
      </ThemeProvider>
    </SettingsProvider>
  </React.StrictMode>,
);
