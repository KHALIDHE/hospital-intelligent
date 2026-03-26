// ============================================================
// src/pages/auth/Register.jsx — HOSPITAL IMAGE REDESIGN
// ============================================================
// Patient self-registration with registration code.
//
// Layout: same split as Login
//   LEFT  (55%) → different hospital photo + info about portal
//   RIGHT (45%) → registration form
//
// Flow:
//   1. Patient gets a registration code from the hospital
//   2. Fills this form with their code + personal info
//   3. Django validates code → creates patient account
//   4. Patient can now log in
//
// API: POST /api/patients/register/
//      Body: { reg_code, first_name, last_name, email, password }
// ============================================================

import { useState }        from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api                 from '../../api/axios'

// ── Different hospital photo than login ───────────────────────
// Reception / welcoming area — fits patient registration theme
const HERO_IMAGE = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=80'

// ── Steps shown on the left panel ────────────────────────────
// Explains the registration process to the patient
const STEPS = [
    {
        number: '01',
        title:  'Get your code',
        desc:   'Your doctor or the reception desk gives you a registration code.',
    },
    {
        number: '02',
        title:  'Fill this form',
        desc:   'Enter your personal details and create a secure password.',
    },
    {
        number: '03',
        title:  'Access your portal',
        desc:   'Log in to view appointments, records, and talk to our AI assistant.',
    },
]


function Register() {

    const navigate = useNavigate()

    // ── Form fields ───────────────────────────────────────────
    const [formData, setFormData] = useState({
        reg_code:   '',
        first_name: '',
        last_name:  '',
        email:      '',
        password:   '',
        confirm:    '',
    })

    // ── UI state ──────────────────────────────────────────────
    const [error,    setError]    = useState('')
    const [success,  setSuccess]  = useState('')
    const [loading,  setLoading]  = useState(false)
    const [showPass, setShowPass] = useState(false)

    // ── Generic field change handler ──────────────────────────
    // Works for all fields — uses input name attribute
    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')   // clear error on any change
    }

    // ── Form submit ───────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // ── Client-side validation ─────────────────────────────
        // Check passwords match before sending to server
        if (formData.password !== formData.confirm) {
            setError('Passwords do not match. Please try again.')
            return
        }

        // Check password length
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.')
            return
        }

        setLoading(true)

        try {
            // Send registration to Django
            // Django will validate the reg_code and create the account
            await api.post('/patients/register/', {
                reg_code:   formData.reg_code.trim().toUpperCase(),
                first_name: formData.first_name.trim(),
                last_name:  formData.last_name.trim(),
                email:      formData.email.trim().toLowerCase(),
                password:   formData.password,
            })

            // Show success → redirect to login after 2s
            setSuccess('Account created successfully! Redirecting to login...')
            setTimeout(() => navigate('/login'), 2000)

        } catch (err) {
            // Show server error (invalid code, email taken, etc.)
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Registration failed. Please check your code and try again.'
            )
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="min-h-screen flex">

            {/* ==================================================
                LEFT PANEL — Hospital photo + registration steps
                Same visual language as Login page
            ================================================== */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col">

                {/* ── Hospital photo ─────────────────────────────
                    Hospital reception — warm, welcoming feel    */}
                <img
                    src={HERO_IMAGE}
                    alt="Patient Registration — Hôpital Intelligent"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* ── Dark overlay ───────────────────────────────
                    Slightly different gradient from Login
                    More emerald tint → patient color theme      */}
                <div className="absolute inset-0 bg-gradient-to-br
                    from-[#0a1628]/95
                    via-[#0d2137]/82
                    to-[#064e3b]/50">
                </div>

                {/* ── Right edge accent line ─────────────────── */}
                <div className="absolute top-0 right-0 w-px h-full
                    bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent">
                </div>

                {/* ── Large cross decoration ─────────────────── */}
                <div className="absolute top-20 -right-6 w-32 h-32 opacity-5">
                    <svg viewBox="0 0 100 100" fill="white">
                        <rect x="35" y="0"  width="30" height="100" rx="4"/>
                        <rect x="0"  y="35" width="100" height="30" rx="4"/>
                    </svg>
                </div>

                {/* ── Emerald orb glow ───────────────────────── */}
                <div className="absolute bottom-0 left-0 w-80 h-80
                    bg-emerald-600 opacity-10 rounded-full
                    -translate-x-32 translate-y-32 blur-3xl">
                </div>


                {/* ── Content above overlay ─────────────────── */}
                <div className="relative z-10 flex flex-col justify-between h-full p-12">

                    {/* ── TOP: Logo ───────────────────────────── */}
                    <div className="flex items-center gap-3 fade-in">
                        <div className="w-11 h-11 bg-emerald-600 rounded-xl
                            flex items-center justify-center
                            shadow-lg shadow-emerald-500/30">
                            {/* Heart icon */}
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-bold text-xl leading-none tracking-tight">
                                Hôpital Intelligent
                            </p>
                            <p className="text-emerald-300 text-xs font-medium mt-0.5 tracking-widest uppercase">
                                Patient Portal
                            </p>
                        </div>
                    </div>


                    {/* ── MIDDLE: Headline + steps ───────────── */}
                    <div className="fade-in-2">

                        {/* Eyebrow */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-px bg-emerald-400"></div>
                            <p className="text-emerald-300 text-xs font-semibold tracking-[0.2em] uppercase">
                                Patient Registration
                            </p>
                        </div>

                        {/* Headline */}
                        <h1 className="text-[3rem] font-bold text-white leading-[1.1] mb-5 font-serif-display">
                            Your health,<br />
                            <span className="text-emerald-400">your portal.</span>
                        </h1>

                        <p className="text-slate-300 text-lg leading-relaxed max-w-md mb-10">
                            Register once using your hospital code to access
                            appointments, medical records, and AI support.
                        </p>

                        {/* ── 3-step process visualization ──────
                            Shows what registration involves      */}
                        <div className="space-y-4">
                            {STEPS.map((step, i) => (
                                <div key={step.number}
                                    className={`flex items-start gap-4 glass rounded-2xl p-4 fade-in-${i + 2}`}>

                                    {/* Step number bubble */}
                                    <div className="w-10 h-10 bg-emerald-600/40 rounded-xl
                                        flex items-center justify-center flex-shrink-0
                                        border border-emerald-400/20">
                                        <span className="text-emerald-300 text-xs font-bold">
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Step content */}
                                    <div>
                                        <p className="text-white text-sm font-semibold">{step.title}</p>
                                        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* ── BOTTOM: Already registered link ──────── */}
                    <div className="flex items-center gap-3 fade-in-4">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full pulse-dot"></div>
                        <p className="text-slate-400 text-xs">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-300 hover:text-white font-medium transition-colors">
                                Sign in here →
                            </Link>
                        </p>
                    </div>

                </div>
            </div>


            {/* ==================================================
                RIGHT PANEL — Registration form
            ================================================== */}
            <div className="w-full lg:w-[45%] flex items-center justify-center
                bg-white p-8 relative overflow-hidden">

                {/* ── Background pattern ────────────────────── */}
                <div className="absolute inset-0 medical-pattern opacity-40"></div>

                {/* ── Emerald orb — top right ───────────────── */}
                <div className="absolute top-0 right-0 w-64 h-64
                    bg-emerald-100 rounded-full opacity-60
                    -translate-y-32 translate-x-32 blur-3xl">
                </div>


                {/* ── Form container ────────────────────────── */}
                <div className="relative z-10 w-full max-w-sm fade-in">

                    {/* ── Mobile logo ──────────────────────── */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="font-bold text-gray-800">Hôpital Intelligent</span>
                    </div>


                    {/* ── Form header ──────────────────────── */}
                    <div className="mb-7">
                        <h2 className="text-3xl font-bold text-slate-900 font-serif-display">
                            Create account
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            Enter your hospital registration code to get started
                        </p>
                    </div>


                    {/* ── Registration code highlight box ──────
                        Visually separated from personal info
                        because it's the most important field   */}
                    <div className="bg-emerald-50 border border-emerald-200
                        rounded-2xl p-4 mb-6">

                        <label className="block text-xs font-bold
                            text-emerald-700 uppercase tracking-wider mb-2">
                            🏥 Hospital Registration Code
                        </label>

                        <input
                            type="text"
                            name="reg_code"
                            value={formData.reg_code}
                            onChange={handleChange}
                            placeholder="e.g. REG-2024-ABC"
                            required
                            // Auto-uppercase as user types
                            onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                            className="w-full px-4 py-3 rounded-xl border-2
                                border-emerald-200 bg-white text-sm font-mono
                                text-slate-800 placeholder-slate-300
                                focus:outline-none focus:ring-2 focus:ring-emerald-400
                                focus:border-transparent tracking-widest uppercase"
                        />

                        <p className="text-xs text-emerald-600 mt-2">
                            This code was given to you by the hospital reception.
                        </p>
                    </div>


                    {/* ── Error message ─────────────────────── */}
                    {error && (
                        <div className="flex items-start gap-3
                            bg-red-50 border border-red-200 text-red-700
                            rounded-2xl p-4 mb-5 fade-in">
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* ── Success message ───────────────────── */}
                    {success && (
                        <div className="flex items-start gap-3
                            bg-emerald-50 border border-emerald-200 text-emerald-700
                            rounded-2xl p-4 mb-5 fade-in">
                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium">{success}</p>
                        </div>
                    )}


                    {/* ── MAIN FORM ─────────────────────────────
                        Personal info + password                 */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* ── First + Last name row ───────────── */}
                        <div className="grid grid-cols-2 gap-3">

                            {/* First name */}
                            <div>
                                <label className="block text-xs font-semibold
                                    text-slate-500 uppercase tracking-wider mb-1.5">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Hassan"
                                    required
                                    className="w-full px-3 py-3 border border-slate-200
                                        rounded-xl text-sm bg-slate-50 hover:bg-white
                                        focus:outline-none focus:ring-2 focus:ring-emerald-400
                                        focus:border-transparent focus:bg-white
                                        transition-colors placeholder-slate-300"
                                />
                            </div>

                            {/* Last name */}
                            <div>
                                <label className="block text-xs font-semibold
                                    text-slate-500 uppercase tracking-wider mb-1.5">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Ali"
                                    required
                                    className="w-full px-3 py-3 border border-slate-200
                                        rounded-xl text-sm bg-slate-50 hover:bg-white
                                        focus:outline-none focus:ring-2 focus:ring-emerald-400
                                        focus:border-transparent focus:bg-white
                                        transition-colors placeholder-slate-300"
                                />
                            </div>
                        </div>

                        {/* ── Email ──────────────────────────── */}
                        <div>
                            <label className="block text-xs font-semibold
                                text-slate-500 uppercase tracking-wider mb-1.5">
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
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200
                                        rounded-xl text-sm bg-slate-50 hover:bg-white
                                        focus:outline-none focus:ring-2 focus:ring-emerald-400
                                        focus:border-transparent focus:bg-white
                                        transition-colors placeholder-slate-300"
                                />
                            </div>
                        </div>

                        {/* ── Password ───────────────────────── */}
                        <div>
                            <label className="block text-xs font-semibold
                                text-slate-500 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2
                                    text-slate-400 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 characters"
                                    required
                                    className="w-full pl-10 pr-16 py-3 border border-slate-200
                                        rounded-xl text-sm bg-slate-50 hover:bg-white
                                        focus:outline-none focus:ring-2 focus:ring-emerald-400
                                        focus:border-transparent focus:bg-white
                                        transition-colors placeholder-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                                        text-xs font-medium text-slate-400
                                        hover:text-slate-600 transition-colors px-1">
                                    {showPass ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {/* ── Confirm password ───────────────── */}
                        <div>
                            <label className="block text-xs font-semibold
                                text-slate-500 uppercase tracking-wider mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2
                                    text-slate-400 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="confirm"
                                    value={formData.confirm}
                                    onChange={handleChange}
                                    placeholder="Repeat your password"
                                    required
                                    // Green border if passwords match, red if not
                                    className={`w-full pl-10 pr-4 py-3 border rounded-xl
                                        text-sm bg-slate-50 hover:bg-white
                                        focus:outline-none focus:ring-2 focus:bg-white
                                        transition-colors placeholder-slate-300
                                        ${formData.confirm && formData.confirm === formData.password
                                            ? 'border-emerald-300 focus:ring-emerald-400'  // match
                                            : formData.confirm
                                                ? 'border-red-300 focus:ring-red-400'      // no match
                                                : 'border-slate-200 focus:ring-emerald-400' // empty
                                        }`}
                                />
                                {/* Passwords match checkmark */}
                                {formData.confirm && formData.confirm === formData.password && (
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Submit button ──────────────────── */}
                        <button
                            type="submit"
                            disabled={loading || !!success}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm
                                text-white bg-emerald-600 hover:bg-emerald-700
                                active:bg-emerald-800 transition-all mt-2
                                disabled:opacity-60 disabled:cursor-not-allowed
                                shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Patient Account'
                            )}
                        </button>

                    </form>


                    {/* ── Back to login link ─────────────────── */}
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already registered?{' '}
                        <Link to="/login"
                            className="text-emerald-600 font-semibold hover:underline">
                            Sign in →
                        </Link>
                    </p>

                    {/* ── Bottom note ───────────────────────── */}
                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">
                            Your data is protected · Hôpital Intelligent © 2026
                        </p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Register