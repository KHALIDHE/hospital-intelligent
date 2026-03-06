// ============================================================
// src/pages/nurse/Profile.jsx
// ============================================================
// Nurse profile page — view and edit profile info.
//
// API calls:
//   GET /api/nurse/profile/ → load profile
//   PUT /api/nurse/profile/ → save changes
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function NurseProfile() {

    const [profile,     setProfile]     = useState(null)
    const [loading,     setLoading]     = useState(true)
    const [error,       setError]       = useState('')
    const [editing,     setEditing]     = useState(false)
    const [fullName,    setFullName]    = useState('')
    const [phone,       setPhone]       = useState('')
    const [ward,        setWard]        = useState('')
    const [shift,       setShift]       = useState('morning')
    const [saving,      setSaving]      = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError,   setSaveError]   = useState('')


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/nurse/profile/')
                const data     = response.data
                setProfile(data)
                setFullName(data.full_name    || '')
                setPhone(data.phone           || '')
                setWard(data.assigned_ward    || '')
                setShift(data.shift           || 'morning')
            } catch (err) {
                setError('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])


    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setSaveError('')
        setSaveSuccess(false)
        try {
            const response = await api.put('/nurse/profile/', {
                full_name:     fullName,
                phone:         phone,
                assigned_ward: ward,
                shift:         shift,
            })
            setProfile(response.data)
            setSaveSuccess(true)
            setEditing(false)
        } catch (err) {
            setSaveError('Failed to save profile')
        } finally {
            setSaving(false)
        }
    }


    if (loading) {
        return (
            <Layout title="My Profile">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="My Profile">
            <div className="max-w-2xl mx-auto">

                {/* Header card */}
                <div className="bg-teal-700 rounded-xl p-6 mb-5 flex items-center gap-5">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <span className="text-teal-700 text-2xl font-bold">
                            {profile?.full_name?.[0]?.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{profile?.full_name}</h2>
                        <p className="text-teal-200 text-sm mt-0.5">
                            Ward: {profile?.assigned_ward} · Shift: {profile?.shift}
                        </p>
                        <p className="text-teal-300 text-xs mt-0.5">{profile?.email}</p>
                    </div>
                </div>

                {saveSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 mb-4 text-sm">
                        ✅ Profile updated successfully
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                    <div className="flex justify-between items-center mb-5">
                        <h3 className="font-semibold text-gray-700">Profile Information</h3>
                        <button
                            onClick={() => { setEditing(!editing); setSaveSuccess(false) }}
                            className="text-sm text-teal-600 hover:underline"
                        >
                            {editing ? 'Cancel' : '✏️ Edit'}
                        </button>
                    </div>

                    {/* View mode */}
                    {!editing && (
                        <div className="space-y-4">
                            {[
                                { label: 'Full Name',      value: profile?.full_name },
                                { label: 'Phone',          value: profile?.phone || '—' },
                                { label: 'Assigned Ward',  value: profile?.assigned_ward },
                                { label: 'Shift',          value: profile?.shift },
                            ].map(item => (
                                <div key={item.label}>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
                                    <p className="text-sm font-medium text-gray-700 mt-0.5">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Edit mode */}
                    {editing && (
                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Full name */}
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Full Name</label>
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                            {/* Phone */}
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Phone</label>
                                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                            {/* Ward */}
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Assigned Ward</label>
                                <input type="text" value={ward} onChange={(e) => setWard(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                            </div>
                            {/* Shift */}
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Shift</label>
                                <select value={shift} onChange={(e) => setShift(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                                    <option value="morning">Morning</option>
                                    <option value="afternoon">Afternoon</option>
                                    <option value="night">Night</option>
                                </select>
                            </div>
                            {saveError && (
                                <p className="text-red-500 text-sm">{saveError}</p>
                            )}
                            <button type="submit" disabled={saving}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default NurseProfile