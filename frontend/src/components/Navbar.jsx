// ============================================================
// src/components/Navbar.jsx
// ============================================================
// This is the TOP bar that appears on every page after login.
//
// What it shows:
//   Left  → current page title (passed as a prop)
//   Right → notification bell + user name + logout button
//
// HOW to use it in any page:
//   import Navbar from '../../components/Navbar'
//   <Navbar title="Dashboard" />
//   <Navbar title="My Patients" />
// ============================================================

import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'


function Navbar({ title }) {

    // ── GET USER AND LOGOUT FUNCTION ──────────────────────────
    // user.email shown in the top right
    // logout() called when user clicks logout button
    const { user, logout } = useAuth()


    return (
        // ── Navbar container ──────────────────────────────────
        // White background, bottom border, flex row layout
        // px-6 py-3 = horizontal and vertical padding
        // shadow-sm = subtle shadow to separate from content
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">

            {/* ── LEFT SIDE — Page title ──────────────────────── */}
            <h2 className="text-lg font-semibold text-gray-700">
                {/* title prop passed from the page component */}
                {/* e.g. "Dashboard", "My Patients", "OR Beds" */}
                {title}
            </h2>

            {/* ── RIGHT SIDE — Notifications + User + Logout ──── */}
            <div className="flex items-center gap-4">

                {/* Notification bell with unread count badge */}
                {/* This is a separate component — see NotificationBell.jsx */}
                <NotificationBell />

                {/* ── User info ─────────────────────────────────── */}
                <div className="flex items-center gap-2">

                    {/* User avatar — circle with first letter of email */}
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                            {/* First letter of email uppercased */}
                            {user?.email?.[0]?.toUpperCase()}
                        </span>
                    </div>

                    {/* User email — hidden on small screens */}
                    <span className="text-sm text-gray-600 hidden md:block">
                        {user?.email}
                    </span>
                </div>

                {/* ── Logout button ─────────────────────────────── */}
                {/* Calls logout() from AuthContext which:
                    1. Calls POST /api/auth/logout/ → deletes cookie
                    2. Clears user from context
                    3. Redirects to /login */}
                <button
                    onClick={logout}
                    className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                    Logout
                </button>

            </div>
        </div>
    )
}

export default Navbar