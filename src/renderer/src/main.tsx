import './assets/main.css'

import App from './App'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import React from 'react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
