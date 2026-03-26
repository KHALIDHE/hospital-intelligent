// ============================================================
// src/components/Navbar.jsx — HOSPITAL REDESIGN
// ============================================================
// Top navigation bar inside the main layout.
// Shows: breadcrumb / page title + notification bell + role badge
//
// Design: white bar with subtle shadow
//   Left  → breadcrumb: "Hôpital Intelligent / Page Title"
//   Right → notifications + role badge + email
// ============================================================

import { useAuth }       from '../context/AuthContext'
import NotificationBell  from './NotificationBell'

// ── Role badge colors ─────────────────────────────────────────
// Each role has its own colored badge in the top-right
const ROLE_BADGE_COLORS = {
    doctor:  'bg-blue-50 text-blue-700 border border-blue-200',
    nurse:   'bg-teal-50 text-teal-700 border border-teal-200',
    admin:   'bg-violet-50 text-violet-700 border border-violet-200',
    patient: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
}


function Navbar({ title }) {

    const { user } = useAuth()

    return (
        // ── Navbar container ───────────────────────────────────
        // White background, subtle bottom shadow
        // h-14 matches the sidebar header height
        <div className="h-14 bg-white border-b border-slate-100 px-6
            flex items-center justify-between flex-shrink-0"
            style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>

            {/* ── LEFT: Breadcrumb + page title ──────────────── */}
            <div className="flex items-center gap-2">

                {/* Breadcrumb prefix — hidden on mobile */}
                <span className="text-slate-300 text-sm hidden sm:block">
                    Hôpital Intelligent
                </span>

                {/* Breadcrumb separator */}
                <svg className="w-3 h-3 text-slate-300 hidden sm:block" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>

                {/* Current page title */}
                <h1 className="text-sm font-semibold text-slate-700">{title}</h1>
            </div>


            {/* ── RIGHT: Actions row ─────────────────────────── */}
            <div className="flex items-center gap-3">

                {/* Notification bell component */}
                <NotificationBell />

                {/* Vertical divider */}
                <div className="w-px h-5 bg-slate-200"></div>

                {/* Role badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                    ${ROLE_BADGE_COLORS[user?.role] || ''}`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>

                {/* User email — hidden on small screens */}
                <span className="text-sm text-slate-600 font-medium hidden md:block">
                    {user?.email}
                </span>

            </div>
        </div>
    )
}

export default Navbar