// ============================================================
// src/main.jsx
// ============================================================
// Entry point of the entire React app.
// This is the first file that runs when the app starts.
// It takes our App component and mounts it into index.html
// specifically into the <div id="root"> element.
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'    // ← Tailwind CSS styles
import App from './App.jsx'
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
)