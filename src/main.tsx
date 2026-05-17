import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import('@tauri-apps/api/window').then((mod: any) => {
  mod.getCurrentWebviewWindow().show()
  const splash = mod.WebviewWindow.getByLabel('splashscreen')
  splash?.close()
}).catch(() => {})
