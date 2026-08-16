import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";
import { ListingFlowProvider } from "./context/ListingFlowContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { LoyaltyProvider } from "./context/LoyaltyContext.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ListingFlowProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <ChatProvider>
              <NotificationProvider>
                <LoyaltyProvider>
                  <App />
                </LoyaltyProvider>
              </NotificationProvider>
            </ChatProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </ListingFlowProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
