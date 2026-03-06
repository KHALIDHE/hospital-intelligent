// ============================================================
// src/router/ProtectedRoute.jsx
// ============================================================
// This component protects pages from unauthorized access.
//
// It wraps every page in App.jsx like this:
//   <ProtectedRoute allowedRoles={['doctor']}>
//     <DoctorDashboard />
//   </ProtectedRoute>
//
// Before showing the page it checks 3 things:
//   1. Still loading? → show spinner
//   2. Not logged in? → redirect to /login
//   3. Wrong role?    → show 403 page
//   4. All good?      → show the page
//
// Example scenarios:
//   Nurse tries to open /dashboard/doctor → sees 403
//   Patient not logged in opens any page  → sent to /login
//   Doctor opens /dashboard/doctor        → page loads normally
// ============================================================

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


function ProtectedRoute({ children, allowedRoles }) {

    // Get current user and loading state from AuthContext
    const { user, loading } = useAuth()


    // ── STEP 1: Still checking auth ───────────────────────────
    // While we wait for /api/auth/me to respond
    // show a simple loading screen
    // Without this the page would flash and redirect incorrectly
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        )
    }


    // ── STEP 2: Not logged in ─────────────────────────────────
    // No user in context means no valid JWT cookie
    // Send them to login page
    // replace → so they can't press back to get to the protected page
    if (!user) {
        return <Navigate to="/login" replace />
    }


    // ── STEP 3: Wrong role ────────────────────────────────────
    // User is logged in but their role is not allowed here
    // e.g. a nurse trying to open /dashboard/doctor
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-red-400">403</h1>
                    <p className="text-xl text-gray-600 mt-3">Access Denied</p>
                    <p className="text-gray-400 mt-1">
                        You don't have permission to view this page
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }


    // ── STEP 4: All checks passed → show the page ─────────────
    return children
}

export default ProtectedRoute