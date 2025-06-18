import React from "react";
import ReactDOM from "react-dom/client";
import { useAuthStore } from "./auth/store/authStore";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./index.css";
import AppRouter from "./router";
import { Toaster } from "./components/ui/sonner";
import { BrowserRouter } from "react-router-dom";

// Initialize the app
const initializeApp = async () => {
  try {
    // Initialize auth store which will also initialize anti-forgery token
    await useAuthStore.getState().initialize();
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
};

// Initialize app before rendering
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <AppRouter />
        <Toaster
          position="bottom-right"
          expand={true}
          richColors={true}
          toastOptions={{
            duration: 4000,
            classNames: {
              error: "border-l-bittersweet",
              success: "border-l-yellow-green",
              warning: "border-l-sunglow",
              info: "border-l-steel-blue",
            },
          }}
        />
      </ThemeProvider>
    </React.StrictMode>
  );
});
