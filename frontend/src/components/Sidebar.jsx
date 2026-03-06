// ============================================================
// src/components/Sidebar.jsx
// ============================================================
// This is the LEFT navigation menu that appears on every page
// after login.
//
// WHY is it a shared component?
// Every role has a sidebar but with DIFFERENT menu items.
// Instead of building 4 separate sidebars, we build ONE
// that shows different links based on the user's role.
//
// HOW it works:
//   1. Gets the current user's role from AuthContext
//   2. Looks up the menu items for that role in MENU_MAP
//   3. Renders those menu items as clickable links
//   4. Highlights the currently active page
//
// HOW to use it in any dashboard page:
//   import Sidebar from '../../components/Sidebar'
//   <Sidebar />
// ============================================================

import { NavLink } from 'react-router-dom'
// NavLink is like a normal link but it knows if it's the
// currently active page → we use this to highlight the active item

import { useAuth } from '../context/AuthContext'
// We need the user's role to know which menu items to show


// ============================================================
// MENU MAP
// Defines which menu items each role sees in the sidebar
// Each item has:
//   path  → the URL to navigate to when clicked
//   label → the text shown in the sidebar
//   icon  → emoji icon shown next to the label
// ============================================================
const MENU_MAP = {

    // ── DOCTOR menu items ─────────────────────────────────────
    doctor: [
        { path: '/dashboard/doctor',  label: 'Dashboard',    icon: '🏠' },
        { path: '/doctor/patients',   label: 'My Patients',  icon: '👥' },
        { path: '/doctor/appointments', label: 'Appointments', icon: '📅' },
        { path: '/doctor/chatbot',    label: 'AI Assistant', icon: '🤖' },
        { path: '/doctor/profile',    label: 'My Profile',   icon: '👤' },
    ],

    // ── NURSE menu items ──────────────────────────────────────
    nurse: [
        { path: '/dashboard/nurse',   label: 'Dashboard',    icon: '🏠' },
        { path: '/nurse/or-beds',     label: 'OR Beds',      icon: '🛏️' },
        { path: '/nurse/doctors',     label: 'Doctors',      icon: '👨‍⚕️' },
        { path: '/nurse/chatbot',     label: 'AI Assistant', icon: '🤖' },
        { path: '/nurse/profile',     label: 'My Profile',   icon: '👤' },
    ],

    // ── ADMIN menu items ──────────────────────────────────────
    admin: [
        { path: '/dashboard/admin',   label: 'Dashboard',    icon: '🏠' },
        { path: '/admin/personnel',   label: 'Personnel',    icon: '👥' },
        { path: '/admin/patients',    label: 'Patients',     icon: '🏥' },
        { path: '/admin/alerts',      label: 'Alerts',       icon: '🚨' },
        { path: '/admin/audit',       label: 'Audit Logs',   icon: '📋' },
        { path: '/admin/chatbot',     label: 'AI Assistant', icon: '🤖' },
        { path: '/admin/profile',     label: 'My Profile',   icon: '👤' },
    ],

    // ── PATIENT menu items ────────────────────────────────────
    patient: [
        { path: '/dashboard/patient',     label: 'Dashboard',    icon: '🏠' },
        { path: '/patient/appointments',  label: 'Appointments', icon: '📅' },
        { path: '/patient/records',       label: 'My Records',   icon: '📄' },
        { path: '/patient/chatbot',       label: 'AI Assistant', icon: '🤖' },
        { path: '/patient/profile',       label: 'My Profile',   icon: '👤' },
    ],
}


// ============================================================
// ROLE COLORS
// Each role has a different accent color in the sidebar header
// so users can instantly know which role they are logged in as
// ============================================================
const ROLE_COLORS = {
    doctor:  'bg-blue-700',
    nurse:   'bg-teal-700',
    admin:   'bg-purple-700',
    patient: 'bg-green-700',
}

// Role display labels (capitalize for UI)
const ROLE_LABELS = {
    doctor:  'Doctor',
    nurse:   'Nurse',
    admin:   'Administrator',
    patient: 'Patient',
}


function Sidebar() {

    // ── GET CURRENT USER ──────────────────────────────────────
    // user.role tells us which menu to show
    // user.email shows in the sidebar header
    const { user } = useAuth()

    // Safety check — if no user somehow, show nothing
    if (!user) return null

    // ── GET MENU ITEMS FOR THIS ROLE ──────────────────────────
    // e.g. if user.role = 'doctor' → menuItems = doctor's menu array
    const menuItems = MENU_MAP[user.role] || []

    // ── GET COLOR FOR THIS ROLE ───────────────────────────────
    const headerColor = ROLE_COLORS[user.role] || 'bg-gray-700'


    // ============================================================
    // RENDER
    // ============================================================
    return (
        // ── Sidebar container ─────────────────────────────────
        // Fixed height, dark background, flex column layout
        // w-64 = 256px wide
        // h-screen = full screen height
        // flex-shrink-0 = never shrink when window is small
        <div className="w-64 h-screen bg-gray-900 flex flex-col flex-shrink-0">

            {/* ── HEADER — Hospital name + user role ─────────── */}
            <div className={`${headerColor} px-5 py-4`}>

                {/* Hospital name */}
                <h1 className="text-white font-bold text-lg">
                    🏥 Hôpital Intelligent
                </h1>

                {/* Role badge */}
                <span className="text-white text-xs opacity-80 mt-1 block">
                    {ROLE_LABELS[user.role]}
                </span>

                {/* User email — truncated if too long */}
                <p className="text-white text-xs opacity-60 mt-1 truncate">
                    {user.email}
                </p>
            </div>

            {/* ── NAVIGATION MENU ────────────────────────────── */}
            {/* flex-1 → takes all remaining vertical space */}
            {/* overflow-y-auto → scroll if menu is too long */}
            <nav className="flex-1 overflow-y-auto py-4">

                {/* Loop through menu items for this role */}
                {menuItems.map((item) => (

                    // NavLink handles active state automatically
                    // When the current URL matches item.path
                    // the className function receives isActive=true
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            // Base classes for every menu item
                            `flex items-center gap-3 px-5 py-3 text-sm transition-colors ` +
                            (isActive
                                // Active page → highlighted background
                                ? 'bg-gray-700 text-white font-semibold border-r-4 border-blue-400'
                                // Inactive page → subtle hover effect
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            )
                        }
                    >
                        {/* Icon */}
                        <span className="text-lg">{item.icon}</span>

                        {/* Label */}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* ── FOOTER — Version info ───────────────────────── */}
            <div className="px-5 py-3 border-t border-gray-700">
                <p className="text-gray-500 text-xs">v1.0.0</p>
            </div>

        </div>
    )
}

export default Sidebar