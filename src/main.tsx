import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GlobalProvider } from "./context";
import { GameProvider } from "./context/GameProvider";
import App from "./App.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </GlobalProvider>
  </StrictMode>
);
