// ============================================================
// src/api/axios.js
// ============================================================
// This is the ONLY file where we configure axios.
// Every other file in the project imports this and uses it.
//
// What this file does:
//   1. Sets the base URL → so we never repeat http://localhost:8000/api
//   2. Sets JSON headers → so Django knows we're sending JSON
//   3. Sends cookies automatically → so JWT cookie is always included
//   4. Saves token to localStorage after login → for Authorization header
//   5. Sends token via Authorization header on every request → fallback
//      for localhost where cross-origin cookies are blocked without HTTPS
//   6. Handles 401 errors globally → redirects to login if token expires
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

    // Send cookies with every request
    // This sends the httpOnly access_token cookie to Django
    // In production (HTTPS) this is enough on its own
    // In localhost (HTTP) cookies are blocked cross-origin → we also use header
    withCredentials: true,
})


// ── REQUEST INTERCEPTOR ──────────────────────────────────────
// Runs automatically BEFORE every request is sent
//
// Why we need this:
//   On localhost, samesite='None' cookies require HTTPS to be sent.
//   Since we're on HTTP, the browser blocks the cookie.
//   Solution: we also save the token in localStorage after login
//   and attach it to every request as an Authorization header.
//   Django's CookieJWTAuthentication reads cookie first, header second.
api.interceptors.request.use((config) => {

    // Get the token saved in localStorage (set after login below)
    const token = localStorage.getItem('access_token')

    if (token) {
        // Attach token to Authorization header
        // Django reads this in CookieJWTAuthentication as fallback
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})


// ── RESPONSE INTERCEPTOR ─────────────────────────────────────
// This runs automatically on EVERY response BEFORE
// it reaches your component code
//
// Think of it as a filter that checks every response:
//   Success (2xx) → save token if present, pass response through
//   401 error     → token expired → clear token → redirect to login
//   Other errors  → let the component handle it
api.interceptors.response.use(

    // ── SUCCESS handler ───────────────────────────────────────
    (response) => {

        // If the response contains an access token (login response)
        // save it to localStorage so the request interceptor above
        // can attach it to all future requests via Authorization header
        if (response.data?.access) {
            localStorage.setItem('access_token', response.data.access)
        }

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
                // Token expired on a real page → clear stale token → send to login
                localStorage.removeItem('access_token')
                window.location.href = '/login'
            }

            // For auth endpoints → silently ignore
            // Let the component's catch block handle it
        }

        // For all other errors (400, 403, 404, 500...)
        // We reject the promise so the component's catch block handles it
        return Promise.reject(error)
    }
)

// Export so every file can import and use it
// Usage: import api from '../../api/axios'
export default api