// ============================================================
// src/pages/auth/Login.jsx — HOSPITAL IMAGE REDESIGN
// ============================================================
// Full-screen split layout:
//   LEFT  (55%) — real hospital photo + brand overlay + stats
//   RIGHT (45%) — login form with role selector
//
// Design: Clinical Precision
//   Dark navy overlay on hospital photo
//   Clean white form panel
//   Role selector as visual cards
//   Animated entrance
//
// API: POST /api/auth/login/ → { email, password, role }
// ============================================================

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

// ── Hospital photo from Unsplash (free license) ───────────────
// Modern hospital corridor — clean, professional, aspirational
const HERO_IMAGE = 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1400&q=80'

// ── Role configuration ────────────────────────────────────────
// Each role has:
//   icon        → SVG icon component
//   label       → display name
//   placeholder → example email shown in input
//   colors      → active/inactive Tailwind classes
const ROLES = [
    {
        value:       'doctor',
        label:       'Doctor',
        placeholder: 'doctor@medecin.hopital.ma',
        // Blue theme
        activeClass: 'border-blue-500 bg-blue-600 text-white shadow-lg',
        inactiveClass: 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50',
    },
    {
        value:       'nurse',
        label:       'Nurse',
        placeholder: 'inf.sara@infirmier.hopital.ma',
        // Teal theme
        activeClass: 'border-teal-500 bg-teal-600 text-white shadow-lg',
        inactiveClass: 'border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:bg-teal-50',
    },
    {
        value:       'admin',
        label:       'Admin',
        placeholder: 'admin@admin.hopital.ma',
        // Violet theme
        activeClass: 'border-violet-500 bg-violet-600 text-white shadow-lg',
        inactiveClass: 'border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:bg-violet-50',
    },
    {
        value:       'patient',
        label:       'Patient',
        placeholder: 'your@email.com',
        // Emerald theme
        activeClass: 'border-emerald-500 bg-emerald-600 text-white shadow-lg',
        inactiveClass: 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50',
    },
]

// ── Role icons as SVG ─────────────────────────────────────────
// Using inline SVG for crisp rendering at any size
const ROLE_ICONS = {
    doctor: (
        // Stethoscope icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11a3 3 0 006 0V3M3 9h18M3 13h18" />
        </svg>
    ),
    nurse: (
        // Cross/medical icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 4v16m-8-8h16" />
        </svg>
    ),
    admin: (
        // Shield icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    patient: (
        // Heart icon
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
}

// ── Post-login redirect map ───────────────────────────────────
const DASHBOARD_MAP = {
    doctor:  '/dashboard/doctor',
    nurse:   '/dashboard/nurse',
    admin:   '/admin/hospital-3d',
    patient: '/dashboard/patient',
}

// ── Stats shown on the hero image ────────────────────────────
// These are decorative — shows the hospital's capabilities
const HERO_STATS = [
    { value: '4',    label: 'Roles'         },
    { value: 'AI',   label: 'Powered'       },
    { value: '24/7', label: 'Available'     },
    { value: '100%', label: 'Secure'        },
]


// ============================================================
// MAIN COMPONENT
// ============================================================
function Login() {

    const navigate  = useNavigate()
    const { login } = useAuth()

    // ── Form state ────────────────────────────────────────────
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [role,     setRole]     = useState('doctor')   // default role
    const [error,    setError]    = useState('')
    const [loading,  setLoading]  = useState(false)
    const [showPass, setShowPass] = useState(false)      // toggle password visibility

    // Get the full role config object for the currently selected role
    const currentRole = ROLES.find(r => r.value === role)


    // ── Form submit handler ───────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        localStorage.removeItem('access_token')  // ← ADD THIS LINE

        try {
            const res = await api.post('/auth/login/', { email, password, role })
            login(res.data.user)
            // Redirect to role-specific dashboard
            navigate(DASHBOARD_MAP[res.data.role])
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }


    return (
        // ── Full viewport split layout ────────────────────────
        <div className="min-h-screen flex">

            {/* ==================================================
                LEFT PANEL — Hospital hero image + brand content
                Hidden on mobile, takes 55% on desktop
            ================================================== */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col">

                {/* ── Background hospital photo ─────────────────
                    Real photo of a modern hospital interior
                    object-cover ensures it fills the space     */}
                <img
                    src={HERO_IMAGE}
                    alt="Hôpital Intelligent — Modern Healthcare"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* ── Dark gradient overlay ──────────────────────
                    Makes text readable over the photo
                    Gradient goes from very dark (top-left)
                    to medium dark (bottom-right)               */}
                <div className="absolute inset-0 bg-gradient-to-br
                    from-[#0a1628]/95
                    via-[#0a1628]/80
                    to-[#112240]/60">
                </div>

                {/* ── Subtle blue accent at right edge ──────────
                    Thin vertical line connecting panels        */}
                <div className="absolute top-0 right-0 w-px h-full
                    bg-gradient-to-b from-transparent via-blue-400/40 to-transparent">
                </div>

                {/* ── Medical cross decoration ───────────────────
                    Large faint cross in bottom-left corner
                    Reinforces hospital identity                 */}
                <div className="absolute bottom-20 -left-10 w-48 h-48 opacity-5">
                    <svg viewBox="0 0 100 100" fill="white">
                        <rect x="35" y="0"  width="30" height="100" rx="4"/>
                        <rect x="0"  y="35" width="100" height="30" rx="4"/>
                    </svg>
                </div>

                {/* ── Blue orb glow — bottom right ──────────────
                    Decorative light effect                      */}
                <div className="absolute bottom-0 right-0 w-96 h-96
                    bg-blue-600 opacity-10 rounded-full
                    translate-x-32 translate-y-32 blur-3xl">
                </div>


                {/* ── Content layer — above all decorations ─────
                    Uses flex column to space top/middle/bottom  */}
                <div className="relative z-10 flex flex-col justify-between h-full p-12">

                    {/* ── TOP: Logo ─────────────────────────────── */}
                    <div className="flex items-center gap-3 fade-in">

                        {/* Heart icon logo */}
                        <div className="w-11 h-11 bg-blue-600 rounded-xl
                            flex items-center justify-center blue-glow">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>

                        <div>
                            <p className="text-white font-bold text-xl leading-none tracking-tight">
                                Hôpital Intelligent
                            </p>
                            <p className="text-blue-300 text-xs font-medium mt-0.5 tracking-widest uppercase">
                                Smart Healthcare System
                            </p>
                        </div>
                    </div>


                    {/* ── MIDDLE: Headline + description ────────── */}
                    <div className="fade-in-2">

                        {/* Eyebrow label */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-px bg-blue-400"></div>
                            <p className="text-blue-300 text-xs font-semibold tracking-[0.2em] uppercase">
                                Next Generation Healthcare
                            </p>
                        </div>

                        {/* Main headline — uses DM Serif Display */}
                        <h1 className="text-[3.2rem] font-bold text-white leading-[1.1] mb-5 font-serif-display">
                            Smarter care,<br />
                            <span className="text-blue-400">every moment.</span>
                        </h1>

                        {/* Description */}
                        <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                            A unified AI-powered platform connecting doctors,
                            nurses, administrators and patients in real time.
                        </p>

                        {/* ── Stats row ─────────────────────────────
                            Quick numbers showing the system scale    */}
                        <div className="grid grid-cols-4 gap-4 mt-10">
                            {HERO_STATS.map((stat, i) => (
                                <div key={stat.label}
                                    className={`glass rounded-2xl p-4 text-center fade-in-${i + 2}`}>
                                    <p className="text-2xl font-bold text-white leading-none">
                                        {stat.value}
                                    </p>
                                    <p className="text-blue-300 text-xs mt-1.5 font-medium">
                                        {stat.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* ── BOTTOM: Trust badges ───────────────────── */}
                    <div className="flex items-center gap-6 fade-in-4">

                        {/* Security badge */}
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 text-green-400">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="text-slate-400 text-xs">HIPAA Compliant</span>
                        </div>

                        {/* Divider dot */}
                        <div className="w-1 h-1 bg-slate-600 rounded-full"></div>

                        {/* AI badge */}
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full pulse-dot"></div>
                            <span className="text-slate-400 text-xs">AI Powered · Gemma3:4b</span>
                        </div>

                        {/* Divider dot */}
                        <div className="w-1 h-1 bg-slate-600 rounded-full"></div>

                        {/* Copyright */}
                        <span className="text-slate-500 text-xs">© 2026</span>
                    </div>

                </div>
            </div>


            {/* ==================================================
                RIGHT PANEL — Login form
                Full width on mobile, 45% on desktop
            ================================================== */}
            <div className="w-full lg:w-[45%] flex items-center justify-center
                bg-white p-8 relative overflow-hidden">

                {/* ── Subtle background pattern ─────────────────
                    Very faint dot grid behind the form          */}
                <div className="absolute inset-0 medical-pattern opacity-40"></div>

                {/* ── Blue accent circle ─────────────────────────
                    Decorative blur in top-right corner          */}
                <div className="absolute top-0 right-0 w-64 h-64
                    bg-blue-100 rounded-full opacity-50
                    -translate-y-32 translate-x-32 blur-3xl">
                </div>


                {/* ── Form container ────────────────────────────── */}
                <div className="relative z-10 w-full max-w-sm fade-in">

                    {/* ── Mobile logo — only on small screens ──── */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="font-bold text-gray-800">Hôpital Intelligent</span>
                    </div>


                    {/* ── Page header ───────────────────────────── */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 font-serif-display">
                            Welcome back
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            Sign in to your account to continue
                        </p>
                    </div>


                    {/* ── ROLE SELECTOR ─────────────────────────────
                        4 clickable cards — one per user role
                        Selecting a role changes the color theme     */}
                    <div className="grid grid-cols-4 gap-2 mb-7">
                        {ROLES.map(r => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => {
                                    setRole(r.value)
                                    setError('')   // clear error on role switch
                                }}
                                className={`
                                    flex flex-col items-center gap-2 p-3
                                    rounded-2xl border-2 text-xs font-semibold
                                    transition-all duration-200
                                    ${role === r.value
                                        ? r.activeClass + ' scale-105'   // selected: colored
                                        : r.inactiveClass                // unselected: gray
                                    }
                                `}
                            >
                                {/* Role icon */}
                                {ROLE_ICONS[r.value]}
                                {/* Role label */}
                                <span>{r.label}</span>
                            </button>
                        ))}
                    </div>


                    {/* ── Error message ─────────────────────────────
                        Shown when login API returns an error        */}
                    {error && (
                        <div className="flex items-start gap-3
                            bg-red-50 border border-red-200 text-red-700
                            rounded-2xl p-4 mb-5 fade-in">
                            {/* Warning icon */}
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}


                    {/* ── LOGIN FORM ────────────────────────────────
                        Standard email + password with show/hide    */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* ── Email field ───────────────────────── */}
                        <div>
                            <label className="block text-xs font-semibold
                                text-slate-500 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                {/* Email icon */}
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2
                                    text-slate-400 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={currentRole?.placeholder}
                                    required
                                    className="w-full pl-10 pr-4 py-3
                                        border border-slate-200 rounded-xl
                                        text-sm bg-slate-50 hover:bg-white
                                        focus:outline-none focus:ring-2 focus:ring-blue-500
                                        focus:border-transparent focus:bg-white
                                        transition-colors placeholder-slate-300"
                                />
                            </div>
                        </div>

                        {/* ── Password field ────────────────────── */}
                        <div>
                            <label className="block text-xs font-semibold
                                text-slate-500 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                {/* Lock icon */}
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2
                                    text-slate-400 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>

                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-16 py-3
                                        border border-slate-200 rounded-xl
                                        text-sm bg-slate-50 hover:bg-white
                                        focus:outline-none focus:ring-2 focus:ring-blue-500
                                        focus:border-transparent focus:bg-white
                                        transition-colors placeholder-slate-300"
                                />

                                {/* Show/hide password toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                                        text-xs font-medium text-slate-400
                                        hover:text-slate-600 transition-colors px-1"
                                >
                                    {showPass ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* ── Submit button ─────────────────────────
                            Color changes based on selected role      */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`
                                w-full py-3.5 rounded-xl font-semibold text-sm
                                text-white transition-all mt-2
                                disabled:opacity-60 disabled:cursor-not-allowed
                                ${role === 'doctor'  ? 'bg-blue-600    hover:bg-blue-700    active:bg-blue-800'    : ''}
                                ${role === 'nurse'   ? 'bg-teal-600    hover:bg-teal-700    active:bg-teal-800'    : ''}
                                ${role === 'admin'   ? 'bg-violet-600  hover:bg-violet-700  active:bg-violet-800'  : ''}
                                ${role === 'patient' ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800' : ''}
                                shadow-md hover:shadow-lg hover:-translate-y-0.5
                            `}
                        >
                            {loading ? (
                                // Loading spinner
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                // Normal state: "Sign in as Doctor"
                                `Sign in as ${currentRole?.label}`
                            )}
                        </button>

                    </form>


                    {/* ── Patient registration link ──────────────
                        Only shown when patient role is selected  */}
                    {role === 'patient' && (
                        <p className="text-center text-sm text-slate-500 mt-5 fade-in">
                            New patient?{' '}
                            <Link to="/register"
                                className="text-emerald-600 font-semibold hover:underline">
                                Register with your code →
                            </Link>
                        </p>
                    )}

                    {/* ── Bottom divider + system note ──────────── */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">
                            Secured by JWT · AI powered by Gemma3:4b
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Login