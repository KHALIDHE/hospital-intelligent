// ============================================================
// src/api/axios.js
// ============================================================
// This is the ONLY file where we configure axios.
// Every other file in the project imports this and uses it.
//
// What this file does:
//   1. Sets the base URL → so we never repeat http://localhost:8000/api
//   2. Sets JSON headers → so Django knows we're sending JSON
//   3. Sends cookies automatically → so JWT token is always included
//   4. Handles 401 errors globally → redirects to login if token expires
//
// How to use it in any other file:
//   import api from '../../api/axios'
//   const response = await api.get('/doctors/me/')
//   const response = await api.post('/auth/login/', { email, password })
// ============================================================

import axios from 'axios'

// ── CREATE CUSTOM AXIOS INSTANCE ─────────────────────────────
// Instead of using axios directly everywhere,
// we create our own version with pre-set configuration
const api = axios.create({

    // Base URL → every request starts with this automatically
    // So api.get('/doctors/me/') becomes:
    // GET http://localhost:8000/api/doctors/me/
    baseURL: 'http://localhost:8000/api',

    // Tell Django we are sending JSON data
    headers: {
        'Content-Type': 'application/json',
    },

    // CRITICAL: Send cookies with every request
    // Without this line, the JWT token stored in the
    // httpOnly cookie would NOT be sent to Django
    // → Every request would return 401 Unauthorized
    withCredentials: true,
})


// ── RESPONSE INTERCEPTOR ─────────────────────────────────────
// This runs automatically on EVERY response BEFORE
// it reaches your component code
//
// Think of it as a filter that checks every response:
//   Success (2xx) → pass it through normally
//   401 error     → token expired → redirect to login
//   Other errors  → let the component handle it
api.interceptors.response.use(

    // ── SUCCESS handler ───────────────────────────────────────
    // Response came back fine → just return it as is
    // Your component will receive it normally
    (response) => {
        return response
    },

    // ── ERROR handler ─────────────────────────────────────────
    // Something went wrong → check what kind of error
    (error) => {

        if (error.response?.status === 401) {

            const url = error.config?.url || ''

            // ── Check if this is an auth endpoint ────────────
            // /auth/me/    → 401 is NORMAL (not logged in yet)
            // /auth/login/ → 401 is NORMAL (wrong password)
            // Any other    → 401 means token expired → redirect
            const isAuthEndpoint = url.includes('/auth/login/')
                                || url.includes('/auth/me/')

            if (!isAuthEndpoint) {
                // Token expired on a real page → send to login
                window.location.href = '/login'
            }

            // For auth endpoints → silently ignore
            // Let the component's catch block handle it
        }

        // For all other errors (400, 403, 404, 500...)
        // We reject the promise so the component's catch block handles it
        // Example: a 400 error on login will be caught in Login.jsx
        return Promise.reject(error)
    }
)

// Export so every file can import and use it
// Usage: import api from '../../api/axios'
export default api