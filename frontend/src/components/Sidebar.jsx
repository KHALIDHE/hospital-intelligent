// ============================================================
// src/components/Sidebar.jsx — HOSPITAL REDESIGN
// ============================================================
// Dark navy sidebar — clinical, professional, authoritative.
//
// Features:
//   - Real hospital logo with heart icon
//   - User avatar with role badge
//   - Role-colored active navigation items
//   - Smooth hover effects
//   - Version + logout at bottom
//
// Role color system:
//   Doctor  → blue
//   Nurse   → teal
//   Admin   → violet
//   Patient → emerald
// ============================================================

import { NavLink }  from 'react-router-dom'
import { useAuth }  from '../context/AuthContext'

// ── Navigation menu per role ──────────────────────────────────
// Each item: path, label, and SVG icon
const MENU_MAP = {
    doctor: [
        {
            path:  '/dashboard/doctor',
            label: 'Dashboard',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        },
        {
            path:  '/doctor/patients',
            label: 'My Patients',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        },
        {
            path:  '/doctor/appointments',
            label: 'Appointments',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        },
        {
            path:  '/doctor/chatbot',
            label: 'AI Assistant',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
        },
        {
            path:  '/doctor/profile',
            label: 'My Profile',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        },
    ],
    nurse: [
        {
            path:  '/dashboard/nurse',
            label: 'Dashboard',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        },
        {
            path:  '/nurse/or-beds',
            label: 'OR Beds',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        },
        // add this after the OR Beds item in the nurse array
        {
            path:  '/nurse/rooms',
            label: 'Room Status',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        },
        {
            path:  '/nurse/doctors',
            label: 'Doctors',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            path:  '/nurse/chatbot',
            label: 'AI Assistant',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
        },
        {
            path:  '/nurse/profile',
            label: 'My Profile',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        },
    ],
    admin: [
        {
            path:  '/dashboard/admin',
            label: 'Dashboard',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        },
        {
            path:  '/admin/personnel',
            label: 'Personnel',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        },
        {
            path:  '/admin/patients',
            label: 'Patients',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        },
        {
            path:  '/admin/alerts',
            label: 'Alerts',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        },
        {
            path:  '/admin/audit',
            label: 'Audit Logs',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        },
        {
            path:  '/admin/chatbot',
            label: 'AI Assistant',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
        },
        // ← ADD THIS ↓
        {
            path:  '/admin/hospital-3d',
            label: 'Vue 3D',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        },
        {
            path:  '/admin/profile',
            label: 'My Profile',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        },
    ],
    patient: [
        {
            path:  '/dashboard/patient',
            label: 'Dashboard',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        },
        {
            path:  '/patient/appointments',
            label: 'Appointments',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        },
        {
            path:  '/patient/records',
            label: 'My Records',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        },
        {
            path:  '/patient/chatbot',
            label: 'AI Assistant',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
        },
        {
            path:  '/patient/profile',
            label: 'My Profile',
            icon:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        },
    ],
}

// ── Role theme colors for active nav items ────────────────────
const ROLE_THEMES = {
    doctor:  { activeBg: 'bg-blue-500',   activeShadow: 'shadow-blue-500/30',   badge: 'bg-blue-500/20 text-blue-300',   dot: 'bg-blue-400'   },
    nurse:   { activeBg: 'bg-teal-500',   activeShadow: 'shadow-teal-500/30',   badge: 'bg-teal-500/20 text-teal-300',   dot: 'bg-teal-400'   },
    admin:   { activeBg: 'bg-violet-500', activeShadow: 'shadow-violet-500/30', badge: 'bg-violet-500/20 text-violet-300', dot: 'bg-violet-400' },
    patient: { activeBg: 'bg-emerald-500',activeShadow: 'shadow-emerald-500/30',badge: 'bg-emerald-500/20 text-emerald-300',dot: 'bg-emerald-400'},
}

const ROLE_LABELS = {
    doctor:  'Doctor Portal',
    nurse:   'Nurse Portal',
    admin:   'Admin Portal',
    patient: 'Patient Portal',
}


function Sidebar() {

    const { user, logout } = useAuth()
    if (!user) return null

    const menuItems = MENU_MAP[user.role]    || []
    const theme     = ROLE_THEMES[user.role] || ROLE_THEMES.doctor

    return (
        // ── Sidebar container ──────────────────────────────────
        // Deep navy background — professional, clinical
        // Fixed height with flex column layout
        <div className="w-64 h-screen bg-[#0a1628] flex flex-col flex-shrink-0
            border-r border-white/5">

            {/* ── TOP SECTION: Logo + User card ─────────────── */}
            <div className="px-5 pt-6 pb-4 border-b border-white/5">

                {/* ── Logo row ──────────────────────────────────── */}
                <div className="flex items-center gap-3 mb-5">
                    {/* Heart icon in role color */}
                    <div className={`w-9 h-9 ${theme.activeBg} rounded-xl
                        flex items-center justify-center flex-shrink-0
                        shadow-lg ${theme.activeShadow}`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">Hôpital Intelligent</p>
                        <p className="text-slate-500 text-xs mt-0.5">{ROLE_LABELS[user.role]}</p>
                    </div>
                </div>

                {/* ── User info card ─────────────────────────────
                    Shows avatar initial + email + role badge     */}
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-3
                    border border-white/5">

                    {/* Avatar circle with role color */}
                    <div className={`w-9 h-9 ${theme.activeBg} rounded-xl
                        flex items-center justify-center text-white
                        text-sm font-bold flex-shrink-0`}>
                        {user.email?.[0]?.toUpperCase()}
                    </div>

                    {/* Email + role */}
                    <div className="min-w-0 flex-1">
                        <p className="text-white/80 text-xs font-medium truncate">
                            {user.email}
                        </p>
                        {/* Role badge */}
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${theme.badge}`}>
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                        </span>
                    </div>

                    {/* Online dot */}
                    <div className={`w-2 h-2 ${theme.dot} rounded-full flex-shrink-0 pulse-dot`}></div>
                </div>
            </div>


            {/* ── NAVIGATION SECTION ───────────────────────────── */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">

                {/* Section label */}
                <p className="text-slate-600 text-xs font-semibold uppercase
                    tracking-widest px-3 mb-3">
                    Navigation
                </p>

                {/* ── Nav items ─────────────────────────────────── */}
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl
                            text-sm font-medium transition-all mb-1 group ` +
                            (isActive
                                // ACTIVE: colored background + white text + glow
                                ? `${theme.activeBg} text-white shadow-lg ${theme.activeShadow}`
                                // INACTIVE: transparent + muted text + hover
                                : 'text-slate-400 hover:text-white hover:bg-white/8'
                            )
                        }
                    >
                        {/* Icon — inherits text color from parent */}
                        <span className="flex-shrink-0">{item.icon}</span>

                        {/* Label */}
                        <span>{item.label}</span>

                        {/* Active indicator dot on the right */}
                        {/* Hidden by default, shown by NavLink active class */}
                    </NavLink>
                ))}
            </nav>


            {/* ── BOTTOM SECTION: Logout + version ─────────────── */}
            <div className="px-3 pb-5 pt-3 border-t border-white/5">

                {/* Logout button */}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5
                        rounded-xl text-sm font-medium text-slate-400
                        hover:text-red-400 hover:bg-red-500/10
                        transition-all group"
                >
                    {/* Logout icon */}
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                </button>

                {/* Version number */}
                <p className="text-slate-700 text-xs px-3 mt-3">
                    v1.0.0 · Hôpital Intelligent
                </p>
            </div>

        </div>
    )
}

export default Sidebar