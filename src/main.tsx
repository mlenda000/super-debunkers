import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GlobalProvider } from "./context";
import { HashRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </HashRouter>
  </StrictMode>
);
