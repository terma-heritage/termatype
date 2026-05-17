import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import('@tauri-apps/api/window').then(async ({ getCurrentWindow, Window }) => {
  await getCurrentWindow().show()
  const splash = await Window.getByLabel('splashscreen')
  await splash?.close()
}).catch(() => {})
