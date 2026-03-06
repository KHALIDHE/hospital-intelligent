// ============================================================
// src/pages/doctor/Dashboard.jsx
// ============================================================
// This is the first page a doctor sees after login.
//
// What it shows:
//   1. Welcome card — doctor name + specialty
//   2. Stats row — total patients, today's appointments, critical patients
//   3. My Patients table — all assigned patients with status badges
//   4. Today's Appointments — list of today's schedule
//
// API calls:
//   GET /api/doctors/me/          → doctor profile
//   GET /api/doctors/my-patients/ → assigned patients
//   GET /api/appointments/my/     → doctor's appointments
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import Layout                  from '../../components/Layout'    // make sure later is .. 
import api                     from '../../api/axios'


// ============================================================
// HELPER — STATUS BADGE
// Returns a colored badge based on patient status
// stable   → green
// alert    → yellow
// critical → red
// ============================================================
function StatusBadge({ status }) {
    const colors = {
        stable:   'bg-green-100 text-green-700 border border-green-200',
        alert:    'bg-yellow-100 text-yellow-700 border border-yellow-200',
        critical: 'bg-red-100 text-red-700 border border-red-200',
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.stable}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    )
}


// ============================================================
// HELPER — APPOINTMENT STATUS BADGE
// ============================================================
function AppointmentBadge({ status }) {
    const colors = {
        scheduled:  'bg-blue-100 text-blue-700',
        confirmed:  'bg-green-100 text-green-700',
        cancelled:  'bg-red-100 text-red-700',
        completed:  'bg-gray-100 text-gray-700',
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || ''}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    )
}


// ============================================================
// MAIN COMPONENT
// ============================================================
function DoctorDashboard() {

    const navigate = useNavigate()

    // ── STATE ─────────────────────────────────────────────────
    const [doctor,       setDoctor]       = useState(null)
    const [patients,     setPatients]     = useState([])
    const [appointments, setAppointments] = useState([])
    const [loading,      setLoading]      = useState(true)
    const [error,        setError]        = useState('')


    // ── FETCH ALL DATA ON MOUNT ───────────────────────────────
    // We call 3 APIs in parallel using Promise.all
    // This is faster than calling them one by one
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Call all 3 APIs at the same time
                const [doctorRes, patientsRes, appointmentsRes] = await Promise.all([
                    api.get('/doctors/me/'),
                    api.get('/doctors/my-patients/'),
                    api.get('/appointments/my/'),
                ])

                setDoctor(doctorRes.data)
                setPatients(patientsRes.data)
                setAppointments(appointmentsRes.data)

            } catch (err) {
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])


    // ── COMPUTED VALUES ───────────────────────────────────────
    // Count critical patients
    const criticalCount = patients.filter(p => p.status === 'critical').length

    // Filter today's appointments
    const today = new Date().toDateString()
    const todayAppointments = appointments.filter(a => {
        return new Date(a.scheduled_at).toDateString() === today
    })


    // ── LOADING STATE ─────────────────────────────────────────
    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // ── ERROR STATE ───────────────────────────────────────────
    if (error) {
        return (
            <Layout title="Dashboard">
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
        <Layout title="Dashboard">

            {/* ── WELCOME CARD ─────────────────────────────────── */}
            <div className="bg-blue-700 text-white rounded-xl px-6 py-5 mb-6">
                <h2 className="text-xl font-bold">
                    Welcome back, Dr. {doctor?.full_name} 👋
                </h2>
                <p className="text-blue-200 text-sm mt-1">
                    {doctor?.specialty} · {doctor?.departments?.join(', ')}
                </p>
            </div>


            {/* ── STATS ROW ────────────────────────────────────── */}
            {/* 3 cards showing key numbers at a glance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                {/* Total patients */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Patients</p>
                    <p className="text-3xl font-bold text-blue-700 mt-1">{patients.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Assigned to you</p>
                </div>

                {/* Today's appointments */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Today's Appointments</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{todayAppointments.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Scheduled for today</p>
                </div>

                {/* Critical patients */}
                <div className={`rounded-xl p-5 shadow-sm border ${criticalCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <p className="text-sm text-gray-500">Critical Patients</p>
                    <p className={`text-3xl font-bold mt-1 ${criticalCount > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        {criticalCount}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {criticalCount > 0 ? '⚠️ Requires attention' : 'All stable'}
                    </p>
                </div>

            </div>


            {/* ── BOTTOM GRID: Patients + Appointments ─────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── MY PATIENTS TABLE ──────────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">

                    {/* Table header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">My Patients</h3>
                        {/* Link to full patients page */}
                        <button
                            onClick={() => navigate('/doctor/patients')}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            View all →
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-5 py-3 text-left">Name</th>
                                    <th className="px-5 py-3 text-left">Code</th>
                                    <th className="px-5 py-3 text-left">Status</th>
                                    <th className="px-5 py-3 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">

                                {/* Empty state */}
                                {patients.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-6 text-center text-gray-400">
                                            No patients assigned yet
                                        </td>
                                    </tr>
                                )}

                                {/* Show max 5 patients on dashboard */}
                                {patients.slice(0, 5).map(patient => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">

                                        {/* Patient name */}
                                        <td className="px-5 py-3 font-medium text-gray-700">
                                            {patient.full_name}
                                        </td>

                                        {/* Patient code */}
                                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                                            {patient.patient_code}
                                        </td>

                                        {/* Status badge */}
                                        <td className="px-5 py-3">
                                            <StatusBadge status={patient.status} />
                                        </td>

                                        {/* View button */}
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* ── TODAY'S APPOINTMENTS ───────────────────────── */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">

                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Today's Schedule</h3>
                        <button
                            onClick={() => navigate('/doctor/appointments')}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            View all →
                        </button>
                    </div>

                    {/* Appointments list */}
                    <div className="divide-y divide-gray-50">

                        {/* Empty state */}
                        {todayAppointments.length === 0 && (
                            <div className="px-5 py-6 text-center text-gray-400 text-sm">
                                No appointments today
                            </div>
                        )}

                        {/* Loop through today's appointments */}
                        {todayAppointments.map(appt => (
                            <div key={appt.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">

                                {/* Time + patient name */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        {/* Appointment time */}
                                        <p className="text-sm font-semibold text-gray-700">
                                            {new Date(appt.scheduled_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>

                                        {/* Patient name */}
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {appt.patient_name}
                                        </p>

                                        {/* Appointment type */}
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {appt.type} · {appt.department}
                                        </p>
                                    </div>

                                    {/* Status badge */}
                                    <AppointmentBadge status={appt.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </Layout>
    )
}

export default DoctorDashboard