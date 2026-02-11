import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { DemoModeProvider } from './lib/demoMode'
import { ErrorBoundary } from './ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <DemoModeProvider>
        <App />
      </DemoModeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
