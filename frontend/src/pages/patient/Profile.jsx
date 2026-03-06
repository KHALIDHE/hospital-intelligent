// ============================================================
// src/pages/patient/Profile.jsx
// ============================================================
// Patient profile — read only for now.
// Patient can see their info but editing is done by doctor/admin.
//
// API calls:
//   GET /api/patients/me/ → patient's own profile
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function PatientProfile() {

    const [patient, setPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/patients/me/')
                setPatient(response.data)
            } catch (err) {
                setError('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    if (loading) {
        return (
            <Layout title="My Profile">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="My Profile">
            <div className="max-w-2xl mx-auto">

                {/* Header card */}
                <div className="bg-green-700 rounded-xl p-6 mb-5 flex items-center gap-5">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-700 text-2xl font-bold">
                            {patient?.full_name?.[0]?.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{patient?.full_name}</h2>
                        <p className="text-green-200 text-sm mt-0.5">
                            Code: <span className="font-mono font-bold">{patient?.patient_code}</span>
                        </p>
                    </div>
                </div>

                {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4">{error}</div>}

                {/* Info card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">My Information</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Full Name',      value: patient?.full_name },
                            { label: 'Date of Birth',  value: patient?.dob ? new Date(patient.dob).toLocaleDateString() : '—' },
                            { label: 'Blood Type',     value: patient?.blood_type || '—' },
                            { label: 'Status',         value: patient?.status },
                            { label: 'Primary Doctor', value: `Dr. ${patient?.primary_doctor_name || '—'}` },
                            { label: 'Patient Code',   value: patient?.patient_code },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                                <span className="text-sm text-gray-400">{item.label}</span>
                                <span className="text-sm font-medium text-gray-700">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    {/* Note to patient */}
                    <p className="text-xs text-gray-400 mt-4 text-center">
                        To update your information, please contact your doctor or hospital administration.
                    </p>
                </div>

            </div>
        </Layout>
    )
}

export default PatientProfile