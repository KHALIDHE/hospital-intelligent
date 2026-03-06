// ============================================================
// src/pages/patient/Records.jsx
// ============================================================
// Patient sees their medical records — read only, simplified.
// Shows: personal info, blood type, dossier PDFs
//
// API calls:
//   GET /api/patients/me/           → patient profile
//   GET /api/patients/:id/dossier/  → PDF dossiers
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function PatientRecords() {

    const [patient,  setPatient]  = useState(null)
    const [dossiers, setDossiers] = useState([])
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const patientRes = await api.get('/patients/me/')
                setPatient(patientRes.data)
                // Fetch dossiers using patient's own ID
                const dossierRes = await api.get(`/patients/${patientRes.data.id}/dossier/`)
                setDossiers(dossierRes.data)
            } catch (err) {
                setError('Failed to load medical records')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <Layout title="My Records">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="My Records">

            {error && <div className="bg-red-50 text-red-600 rounded-lg p-4 mb-4">{error}</div>}

            {/* Personal info card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
                <h3 className="font-semibold text-gray-700 mb-4">My Medical Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Full Name',     value: patient?.full_name },
                        { label: 'Date of Birth', value: patient?.dob ? new Date(patient.dob).toLocaleDateString() : '—' },
                        { label: 'Blood Type',    value: patient?.blood_type || '—' },
                        { label: 'Status',        value: patient?.status || '—' },
                        { label: 'Patient Code',  value: patient?.patient_code },
                        { label: 'Primary Doctor', value: `Dr. ${patient?.primary_doctor_name || '—'}` },
                    ].map(item => (
                        <div key={item.label}>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* PDF Dossiers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-700 mb-4">Medical Dossiers</h3>
                {dossiers.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No dossiers uploaded yet</p>
                ) : (
                    <div className="space-y-2">
                        {dossiers.map(dossier => (
                            <div key={dossier.id}
                                className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-3 border border-green-100">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        📄 Version {dossier.version}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(dossier.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <a href={dossier.pdf_url} target="_blank" rel="noopener noreferrer"
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                                    View PDF
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </Layout>
    )
}

export default PatientRecords