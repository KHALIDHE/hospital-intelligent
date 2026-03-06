// ============================================================
// src/pages/auth/Login.jsx
// ============================================================
// This is the first page every user sees.
//
// What this page does:
//   1. Shows a form: email + password + role selector
//   2. User fills the form and clicks Login
//   3. We call POST /api/auth/login/ with the form data
//   4. Django checks: domain + password + role
//   5. If correct → Django sets JWT cookie + returns user info
//   6. We save user to AuthContext via login()
//   7. We redirect to the correct dashboard based on role:
//        doctor  → /dashboard/doctor
//        nurse   → /dashboard/nurse
//        admin   → /dashboard/admin
//        patient → /dashboard/patient
//   8. If wrong → show error message under the form
// ============================================================

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'  // ✅ added Link
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'


function Login() {

    // ── NAVIGATION ────────────────────────────────────────────
    // useNavigate lets us redirect to another page programmatically
    // e.g. navigate('/dashboard/doctor') after login
    const navigate   = useNavigate()

    // ── AUTH CONTEXT ──────────────────────────────────────────
    // We need the login() function to save user to global state
    // after successful login
    const { login }  = useAuth()

    // ── FORM STATE ────────────────────────────────────────────
    // These store what the user types in the form fields
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [role,     setRole]     = useState('doctor') // default role

    // ── UI STATE ──────────────────────────────────────────────
    // error   → error message shown under the form
    // loading → true while waiting for Django response
    //           disables the button so user can't click twice
    const [error,   setError]   = useState('')
    const [loading, setLoading] = useState(false)


    // ── REDIRECT MAP ──────────────────────────────────────────
    // After login, redirect each role to their dashboard
    const dashboardMap = {
        doctor:  '/dashboard/doctor',
        nurse:   '/dashboard/nurse',
        admin:   '/dashboard/admin',
        patient: '/dashboard/patient',
    }


    // ============================================================
    // HANDLE SUBMIT
    // This runs when the user clicks the Login button
    // ============================================================
    const handleSubmit = async (e) => {

        // Prevent the browser from refreshing the page
        // (default HTML form behavior)
        e.preventDefault()

        // Clear any previous error message
        setError('')

        // Show loading spinner on button
        setLoading(true)

        try {
            // ── Call Django login API ─────────────────────────
            // Send email, password, role to backend
            // Django will:
            //   1. Check email domain matches role
            //   2. Check password with bcrypt
            //   3. Check role matches DB
            //   4. Set JWT token in httpOnly cookie
            //   5. Return user info
            const response = await api.post('/auth/login/', {
                email,
                password,
                role,
            })

            // ── Save user to global context ───────────────────
            // response.data.user = { id, email, role }
            // After this, every page can access user via useAuth()
            login(response.data.user)

            // ── Redirect to correct dashboard ─────────────────
            // Based on the role returned from Django
            // Not the role selected in the form — the one in DB
            const destination = dashboardMap[response.data.role]
            navigate(destination)

        } catch (err) {

            // ── Handle errors ─────────────────────────────────
            // err.response.data is what Django returned as error
            // Examples:
            //   { error: 'Invalid credentials' }
            //   { error: 'Email must end with @medecin.hopital.ma' }
            //   { error: 'Role mismatch' }
            const message = err.response?.data?.error || 'Login failed. Please try again.'
            setError(message)

        } finally {
            // Always stop loading whether success or error
            setLoading(false)
        }
    }


    // ============================================================
    // RENDER
    // ============================================================
    return (
        // ── Full screen centered layout ───────────────────────
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">

            {/* ── Login card ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

                {/* ── Header ───────────────────────────────────── */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-800">🏥 Hôpital Intelligent</h1>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                {/* ── Error message ─────────────────────────────── */}
                {/* Only shown when error state is not empty */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-5 text-sm">
                        {error}
                    </div>
                )}

                {/* ── Form ──────────────────────────────────────── */}
                {/* onSubmit → calls handleSubmit when form is submitted */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ── Role selector ───────────────────────────── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            I am a
                        </label>
                        {/* When user changes this → update role state */}
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="admin">Administrator</option>
                            <option value="patient">Patient</option>
                        </select>
                    </div>

                    {/* ── Email field ──────────────────────────────── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={
                                // Show placeholder based on selected role
                                role === 'doctor'  ? 'dr.ahmed@medecin.hopital.ma'   :
                                role === 'nurse'   ? 'inf.sara@infirmier.hopital.ma' :
                                role === 'admin'   ? 'admin@admin.hopital.ma'        :
                                'your@email.com'
                            }
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* ── Password field ───────────────────────────── */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* ── Submit button ────────────────────────────── */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {/* Show spinner text while loading */}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                </form>

                {/* ── Patient registration link ─────────────────── */}
                {/* Only shown when role = patient */}
                {role === 'patient' && (
                    <p className="text-center text-sm text-gray-500 mt-5">
                        First time?{' '}
                        {/* ✅ FIXED: added missing <Link opening tag, replaced <a href with <Link to */}
                        <Link
                            to="/register"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Register with your code
                        </Link>
                    </p>
                )}

            </div>
        </div>
    )
}

export default Login