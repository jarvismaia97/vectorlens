import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { DemoModeProvider } from './lib/demoMode'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DemoModeProvider>
      <App />
    </DemoModeProvider>
  </StrictMode>,
)
