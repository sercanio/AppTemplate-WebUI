import React from 'react'
import ReactDOM from 'react-dom/client'
import { useAuthStore } from './auth/store/authStore'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'
import AppRouter from './router';

// Initialize the app
const initializeApp = async () => {
  try {
    // Initialize auth store which will also initialize anti-forgery token
    await useAuthStore.getState().initialize();
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// Initialize app before rendering
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </React.StrictMode>,
  )
});
