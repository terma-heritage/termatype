import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import('@tauri-apps/api/window').then(({ getCurrentWebviewWindow, WebviewWindow }) => {
  getCurrentWebviewWindow().show()
  const splash = WebviewWindow.getByLabel('splashscreen')
  splash?.close()
}).catch(() => {})
