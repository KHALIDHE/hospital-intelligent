// ============================================================
// src/pages/admin/Dashboard.jsx
// ============================================================
// First page admin sees after login.
// Shows: hospital-wide stats, all patients summary, staff count
//
// API calls:
//   GET /api/patients/all/         → all patients
//   GET /api/appointments/all/     → all appointments
//   GET /api/notifications/        → all alerts
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function AdminDashboard() {

    const navigate = useNavigate()

    const [patients,      setPatients]      = useState([])
    const [appointments,  setAppointments]  = useState([])
    const [alerts,        setAlerts]        = useState([])
    const [loading,       setLoading]       = useState(true)
    const [error,         setError]         = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, appointmentsRes, alertsRes] = await Promise.all([
                    api.get('/patients/all/'),
                    api.get('/appointments/all/'),
                    api.get('/notifications/'),
                ])
                setPatients(patientsRes.data)
                setAppointments(appointmentsRes.data)
                setAlerts(alertsRes.data)
            } catch (err) {
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Computed stats
    const criticalCount  = patients.filter(p => p.status === 'critical').length
    const alertCount     = patients.filter(p => p.status === 'alert').length
    const stableCount    = patients.filter(p => p.status === 'stable').length
    const todayAppts     = appointments.filter(a =>
        new Date(a.scheduled_at).toDateString() === new Date().toDateString()
    ).length
    const unreadAlerts   = alerts.filter(a => !a.is_read).length

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
            <div className="bg-purple-700 text-white rounded-xl px-6 py-5 mb-6">
                <h2 className="text-xl font-bold">Hospital Administration 🏥</h2>
                <p className="text-purple-200 text-sm mt-1">Full overview of all hospital operations</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Total Patients</p>
                    <p className="text-3xl font-bold text-purple-700 mt-1">{patients.length}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Today Appointments</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{todayAppts}</p>
                </div>
                <div className={`rounded-xl p-5 shadow-sm border ${criticalCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Critical Patients</p>
                    <p className={`text-3xl font-bold mt-1 ${criticalCount > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        {criticalCount}
                    </p>
                </div>
                <div className={`rounded-xl p-5 shadow-sm border ${unreadAlerts > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Unread Alerts</p>
                    <p className={`text-3xl font-bold mt-1 ${unreadAlerts > 0 ? 'text-orange-600' : 'text-gray-700'}`}>
                        {unreadAlerts}
                    </p>
                </div>
            </div>

            {/* Patient status breakdown + recent appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Patient status breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Patient Status</h3>
                        <button onClick={() => navigate('/admin/patients')}
                            className="text-sm text-purple-600 hover:underline">View all →</button>
                    </div>
                    <div className="space-y-3">
                        {/* Stable */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600">Stable</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Progress bar */}
                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: patients.length ? `${(stableCount / patients.length) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 w-6">{stableCount}</span>
                            </div>
                        </div>
                        {/* Alert */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-sm text-gray-600">Alert</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 rounded-full"
                                        style={{ width: patients.length ? `${(alertCount / patients.length) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 w-6">{alertCount}</span>
                            </div>
                        </div>
                        {/* Critical */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-sm text-gray-600">Critical</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 rounded-full"
                                        style={{ width: patients.length ? `${(criticalCount / patients.length) * 100}%` : '0%' }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 w-6">{criticalCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent appointments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700">Recent Appointments</h3>
                        <button onClick={() => navigate('/admin/patients')}
                            className="text-sm text-purple-600 hover:underline">View all →</button>
                    </div>
                    <div className="space-y-2">
                        {appointments.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4">No appointments yet</p>
                        )}
                        {appointments.slice(0, 5).map(appt => (
                            <div key={appt.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{appt.patient_name}</p>
                                    <p className="text-xs text-gray-400">
                                        Dr. {appt.doctor_name} · {new Date(appt.scheduled_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    appt.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                    appt.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    {appt.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </Layout>
    )
}

export default AdminDashboard