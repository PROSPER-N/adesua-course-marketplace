import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import { BrowserRouter } from 'react-router'

import { Toaster } from 'react-hot-toast'

import './index.css'

import { AuthProvider } from './context/AuthContext.jsx'

import { CurrencyProvider } from './context/CurrencyContext.jsx'

import { startTheme } from './utils/theme.js'

import App from './App.jsx'

startTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CurrencyProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              // Toasts are white by default, so they take the theme colours instead.
              style: {
                background: 'var(--color-card)',
                border: '1px solid var(--color-line)',
                color: 'var(--color-ink)',
              },
            }}
          />
        </AuthProvider>
      </CurrencyProvider>
    </BrowserRouter>
  </StrictMode>,
)