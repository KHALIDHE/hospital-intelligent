// ============================================================
// src/context/AuthContext.jsx
// ============================================================
// WHY do we need this file?
//
// When a user logs in, we need to know WHO they are on
// EVERY page of the app. Without this, every page would have
// to call /api/auth/me separately to find out who is logged in.
//
// This file solves that by:
//   1. Calling /api/auth/me ONCE when the app loads
//   2. Storing the result in a global state called "context"
//   3. Every page can instantly read the user data via useAuth()
//
// How to use it in any page:
//   import { useAuth } from '../../context/AuthContext'
//   const { user, login, logout } = useAuth()
//   console.log(user.role)  // 'doctor'
//   console.log(user.email) // 'dr.ahmed@medecin.hopital.ma'
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'


// ── CREATE THE CONTEXT OBJECT ─────────────────────────────────
// This is like creating an empty box that will hold our user data
// We fill it inside AuthProvider below
const AuthContext = createContext(null)


// ============================================================
// AUTH PROVIDER
// This component wraps your entire app (done in main.jsx)
// Everything inside it can access user, login, logout
// ============================================================
export function AuthProvider({ children }) {

    // ── STATE ─────────────────────────────────────────────────
    // user    → the logged-in user object { id, email, role }
    //           null means nobody is logged in
    const [user, setUser]       = useState(null)

    // loading → true while we check if user has a valid token
    //           we show a spinner during this time
    //           prevents the page from flashing before redirecting
    const [loading, setLoading] = useState(true)


    // ── CHECK AUTH ON APP LOAD ────────────────────────────────
    // useEffect with [] runs ONCE when the app first opens
    // It calls /api/auth/me to check if a valid JWT cookie exists
    // If yes → user is set → they stay on their page
    // If no  → user is null → ProtectedRoute redirects to login
    useEffect(() => {

        const checkAuth = async () => {
            try {
                // Django reads the JWT cookie and returns user info
                const response = await api.get('/auth/me/')

                // Save user to state → available everywhere via useAuth()
                setUser(response.data)

            } catch (error) {
                // 401 → no valid cookie → user is not logged in
                setUser(null)

            } finally {
                // Whether success or error → stop showing the spinner
                setLoading(false)
            }
        }

        checkAuth()

    }, []) // ← empty array means run once on mount


    // ── LOGIN FUNCTION ────────────────────────────────────────
    // Called from Login.jsx after successful login API call
    // Saves the user to context so all pages can access it
    // Parameter: userData = { id, email, role } from Django response
    const login = (userData) => {
        setUser(userData)
    }


    // ── LOGOUT FUNCTION ───────────────────────────────────────
    // Called from Navbar.jsx when user clicks logout button
    // 1. Calls Django to delete the JWT cookie
    // 2. Clears user from context
    // 3. Redirects to login page
    const logout = async () => {
        try {
            // Tell Django to delete the httpOnly cookie
            await api.post('/auth/logout/')
        } catch (error) {
            // Even if API call fails → still log out on frontend
        }

        // Clear user from context → all pages now see user = null
        setUser(null)

        // Redirect to login
        window.location.href = '/login'
    }


    // ── PROVIDE TO ALL CHILDREN ───────────────────────────────
    // Everything inside <AuthProvider> can now access:
    // user, loading, login, logout
    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}


// ── CUSTOM HOOK ───────────────────────────────────────────────
// Shortcut so we don't write useContext(AuthContext) everywhere
// Usage in any component:
//   const { user, logout } = useAuth()
export function useAuth() {
    return useContext(AuthContext)
}