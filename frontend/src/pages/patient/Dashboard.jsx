// ============================================================
// src/pages/patient/Dashboard.jsx
// ============================================================
// First page patient sees after login.
// Shows: personal info card + upcoming appointments + records summary
//
// API calls:
//   GET /api/patients/me/          → patient's own profile
//   GET /api/appointments/my/      → patient's appointments
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function PatientDashboard() {

    const navigate = useNavigate()

    const [patient,      setPatient]      = useState(null)
    const [appointments, setAppointments] = useState([])
    const [loading,      setLoading]      = useState(true)
    const [error,        setError]        = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientRes, appointmentsRes] = await Promise.all([
                    api.get('/patients/me/'),
                    api.get('/appointments/my/'),
                ])
                setPatient(patientRes.data)
                setAppointments(appointmentsRes.data)
            } catch (err) {
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Upcoming appointments — future, not cancelled
    const upcoming = appointments.filter(a =>
        new Date(a.scheduled_at) > new Date() && a.status !== 'cancelled'
    )

    // Past appointments
    const past = appointments.filter(a =>
        new Date(a.scheduled_at) <= new Date()
    )

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout title="Dashboard">
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">{error}</div>
            </Layout>
        )
    }

    return (
        <Layout title="Dashboard">

            {/* Welcome banner */}
            <div className="bg-green-700 text-white rounded-xl px-6 py-5 mb-6">
                <h2 className="text-xl font-bold">Welcome, {patient?.full_name} 👋</h2>
                <p className="text-green-200 text-sm mt-1">
                    Patient Code: <span className="font-mono font-bold">{patient?.patient_code}</span>
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase">Upcoming Appointments</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{upcoming.length}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase">Past Appointments</p>
                    <p className="text-3xl font-bold text-gray-600 mt-1">{past.length}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase">My Status</p>
                    <p className={`text-xl font-bold mt-1 ${
                        patient?.status === 'critical' ? 'text-red-600' :
                        patient?.status === 'alert'    ? 'text-yellow-600' :
                        'text-green-600'
                    }`}>
                        {patient?.status?.charAt(0).toUpperCase() + patient?.status?.slice(1)}
                    </p>
                </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* My info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-700 mb-4">My Information</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'Date of Birth', value: patient?.dob ? new Date(patient.dob).toLocaleDateString() : '—' },
                            { label: 'Blood Type',    value: patient?.blood_type || '—' },
                            { label: 'Primary Doctor', value: `Dr. ${patient?.primary_doctor_name || '—'}` },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                                <span className="text-sm text-gray-400">{item.label}</span>
                                <span className="text-sm font-medium text-gray-700">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming appointments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Upcoming Appointments</h3>
                        <button onClick={() => navigate('/patient/appointments')}
                            className="text-sm text-green-600 hover:underline">View all →</button>
                    </div>
                    <div className="space-y-2">
                        {upcoming.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4">No upcoming appointments</p>
                        )}
                        {upcoming.slice(0, 3).map(appt => (
                            <div key={appt.id} className="bg-green-50 rounded-lg px-4 py-3">
                                <p className="text-sm font-medium text-gray-700">
                                    Dr. {appt.doctor_name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {new Date(appt.scheduled_at).toLocaleString()} · {appt.department}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </Layout>
    )
}

export default PatientDashboard