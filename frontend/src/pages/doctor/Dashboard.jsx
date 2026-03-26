// ============================================================
// src/pages/doctor/Dashboard.jsx — REDESIGNED
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import Layout   from '../../components/Layout'
import StatCard from '../../components/StatCard'
import api      from '../../api/axios'


// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        stable:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        alert:    'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        critical: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || map.stable}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                status === 'critical' ? 'bg-red-500' :
                status === 'alert'    ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    )
}


function DoctorDashboard() {

    const navigate = useNavigate()
    const [doctor,       setDoctor]       = useState(null)
    const [patients,     setPatients]     = useState([])
    const [appointments, setAppointments] = useState([])
    const [loading,      setLoading]      = useState(true)
    const [error,        setError]        = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
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

    const criticalCount     = patients.filter(p => p.status === 'critical').length
    const today             = new Date().toDateString()
    const todayAppointments = appointments.filter(a =>
        new Date(a.scheduled_at).toDateString() === today
    )

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout title="Dashboard">
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>
            </Layout>
        )
    }

    return (
        <Layout title="Dashboard">

            {/* ── Welcome banner ───────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
                {/* Decorative circle */}
                <div className="absolute right-0 top-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="relative z-10">
                    <p className="text-blue-200 text-sm font-medium mb-1">Good morning 👋</p>
                    <h2 className="text-xl font-bold">Dr. {doctor?.full_name}</h2>
                    <p className="text-blue-200 text-sm mt-1">
                        {doctor?.specialty} · {doctor?.departments?.join(', ')}
                    </p>
                </div>
            </div>

            {/* ── Stats row ────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard
                    icon="👥"
                    label="Total Patients"
                    value={patients.length}
                    note="Assigned to you"
                    color="blue"
                />
                <StatCard
                    icon="📅"
                    label="Today's Appointments"
                    value={todayAppointments.length}
                    note="Scheduled for today"
                    color="teal"
                />
                <StatCard
                    icon="⚠️"
                    label="Critical Patients"
                    value={criticalCount}
                    note={criticalCount > 0 ? 'Requires attention' : 'All stable'}
                    color={criticalCount > 0 ? 'red' : 'green'}
                />
            </div>


            {/* ── Bottom grid ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Patients table */}
                <div className="bg-white rounded-2xl border border-gray-100"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-sm">My Patients</h3>
                        <button onClick={() => navigate('/doctor/patients')}
                            className="text-xs text-blue-600 font-medium hover:underline">
                            View all →
                        </button>
                    </div>

                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Patient</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">
                                        No patients assigned yet
                                    </td>
                                </tr>
                            )}
                            {patients.slice(0, 5).map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            {/* Mini avatar */}
                                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                                                {p.full_name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 text-sm">{p.full_name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{p.patient_code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <StatusBadge status={p.status} />
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button onClick={() => navigate(`/doctor/patients/${p.id}`)}
                                            className="text-xs text-blue-600 font-medium hover:underline">
                                            View →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>


                {/* Today's schedule */}
                <div className="bg-white rounded-2xl border border-gray-100"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>

                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 text-sm">Today's Schedule</h3>
                        <button onClick={() => navigate('/doctor/appointments')}
                            className="text-xs text-blue-600 font-medium hover:underline">
                            View all →
                        </button>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {todayAppointments.length === 0 && (
                            <div className="px-5 py-8 text-center text-gray-400 text-sm">
                                No appointments today
                            </div>
                        )}
                        {todayAppointments.map(appt => (
                            <div key={appt.id} className="px-5 py-4 flex gap-4 items-center hover:bg-gray-50 transition-colors">
                                {/* Time block */}
                                <div className="bg-blue-50 rounded-xl px-3 py-2 text-center min-w-14 flex-shrink-0">
                                    <p className="text-sm font-bold text-blue-700 leading-tight">
                                        {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{appt.patient_name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {appt.type} · {appt.department}
                                    </p>
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