import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PushWalletProvider } from "./components/PushWalletProvider";

createRoot(document.getElementById("root")!).render(
  <PushWalletProvider>
    <App />
  </PushWalletProvider>
);
