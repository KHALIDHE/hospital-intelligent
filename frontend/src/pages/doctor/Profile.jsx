// ============================================================
// src/pages/doctor/Profile.jsx
// ============================================================
// This page lets the doctor view and edit their profile.
//
// What it shows:
//   1. Profile card — name, email, specialty, phone, departments
//   2. Edit form — update name, specialty, phone, departments
//   3. Change password section
//
// API calls:
//   GET /api/doctors/me/  → load current profile
//   PUT /api/doctors/me/  → save updated profile
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function DoctorProfile() {

    // ── STATE ─────────────────────────────────────────────────
    const [profile,  setProfile]  = useState(null)
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState('')

    // Edit mode — toggles between view and edit
    const [editing,  setEditing]  = useState(false)

    // Form fields — pre-filled with current profile data
    const [fullName,     setFullName]     = useState('')
    const [specialty,    setSpecialty]    = useState('')
    const [phone,        setPhone]        = useState('')
    const [departments,  setDepartments]  = useState('')
    // departments stored as comma-separated string
    // e.g. "cardiology, urgency"
    // converted to array when saving

    // Save state
    const [saving,       setSaving]       = useState(false)
    const [saveSuccess,  setSaveSuccess]  = useState(false)
    const [saveError,    setSaveError]    = useState('')


    // ── FETCH PROFILE ON MOUNT ────────────────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/doctors/me/')
                const data     = response.data
                setProfile(data)

                // Pre-fill form fields with current values
                setFullName(data.full_name    || '')
                setSpecialty(data.specialty   || '')
                setPhone(data.phone           || '')
                // Convert array to comma-separated string for the input
                // ['cardiology', 'urgency'] → 'cardiology, urgency'
                setDepartments(data.departments?.join(', ') || '')

            } catch (err) {
                setError('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])


    // ── SAVE PROFILE ──────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setSaveSuccess(false)
        setSaveError('')

        try {
            // Convert departments string back to array
            // 'cardiology, urgency' → ['cardiology', 'urgency']
            const departmentsArray = departments
                .split(',')
                .map(d => d.trim())         // remove spaces
                .filter(d => d.length > 0)  // remove empty strings

            const response = await api.put('/doctors/me/', {
                full_name:   fullName,
                specialty:   specialty,
                phone:       phone,
                departments: departmentsArray,
            })

            // Update profile state with new data
            setProfile(response.data)
            setSaveSuccess(true)
            setEditing(false)

        } catch (err) {
            setSaveError(err.response?.data?.error || 'Failed to save profile')
        } finally {
            setSaving(false)
        }
    }


    // ── LOADING STATE ─────────────────────────────────────────
    if (loading) {
        return (
            <Layout title="My Profile">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </Layout>
        )
    }

    // ── ERROR STATE ───────────────────────────────────────────
    if (error) {
        return (
            <Layout title="My Profile">
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
                    {error}
                </div>
            </Layout>
        )
    }


    // ============================================================
    // RENDER
    // ============================================================
    return (
        <Layout title="My Profile">

            <div className="max-w-2xl mx-auto">

                {/* ── PROFILE HEADER CARD ──────────────────────── */}
                <div className="bg-blue-700 rounded-xl p-6 mb-5 flex items-center gap-5">

                    {/* Avatar circle with first letter */}
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <span className="text-blue-700 text-2xl font-bold">
                            {profile?.full_name?.[0]?.toUpperCase()}
                        </span>
                    </div>

                    {/* Name + specialty */}
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Dr. {profile?.full_name}
                        </h2>
                        <p className="text-blue-200 text-sm mt-0.5">
                            {profile?.specialty}
                        </p>
                        <p className="text-blue-300 text-xs mt-0.5">
                            {profile?.email}
                        </p>
                    </div>
                </div>


                {/* ── SUCCESS MESSAGE ───────────────────────────── */}
                {saveSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 mb-4 text-sm">
                        ✅ Profile updated successfully
                    </div>
                )}

                {/* ── ERROR MESSAGE ─────────────────────────────── */}
                {saveError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                        {saveError}
                    </div>
                )}


                {/* ── PROFILE DETAILS CARD ─────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                    {/* Card header with edit toggle */}
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="font-semibold text-gray-700">Profile Information</h3>
                        <button
                            onClick={() => {
                                setEditing(!editing)
                                setSaveSuccess(false)
                                setSaveError('')
                            }}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {editing ? 'Cancel' : '✏️ Edit'}
                        </button>
                    </div>

                    {/* ── VIEW MODE ─────────────────────────────── */}
                    {!editing && (
                        <div className="space-y-4">

                            {/* Full name */}
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Full Name
                                </p>
                                <p className="text-sm font-medium text-gray-700 mt-0.5">
                                    {profile?.full_name}
                                </p>
                            </div>

                            {/* Specialty */}
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Specialty
                                </p>
                                <p className="text-sm font-medium text-gray-700 mt-0.5">
                                    {profile?.specialty}
                                </p>
                            </div>

                            {/* Phone */}
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Phone
                                </p>
                                <p className="text-sm font-medium text-gray-700 mt-0.5">
                                    {profile?.phone || '—'}
                                </p>
                            </div>

                            {/* Departments */}
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Departments
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {profile?.departments?.map(dept => (
                                        <span
                                            key={dept}
                                            className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-0.5 rounded-full text-xs font-medium"
                                        >
                                            {dept}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ── EDIT MODE ─────────────────────────────── */}
                    {editing && (
                        <form onSubmit={handleSave} className="space-y-4">

                            {/* Full name input */}
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* Specialty input */}
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    Specialty
                                </label>
                                <input
                                    type="text"
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* Phone input */}
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* Departments input */}
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    Departments
                                </label>
                                {/* Comma separated — converted to array when saving */}
                                <input
                                    type="text"
                                    value={departments}
                                    onChange={(e) => setDepartments(e.target.value)}
                                    placeholder="cardiology, urgency, icu"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Separate departments with commas
                                </p>
                            </div>

                            {/* Save button */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>

                        </form>
                    )}
                </div>

            </div>
        </Layout>
    )
}

export default DoctorProfile
