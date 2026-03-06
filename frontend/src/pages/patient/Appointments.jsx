// ============================================================
// src/pages/patient/Appointments.jsx
// ============================================================
// Patient sees all their appointments — upcoming + past.
// Can cancel upcoming appointments.
//
// API calls:
//   GET    /api/appointments/my/   → all patient appointments
//   DELETE /api/appointments/:id/  → cancel appointment
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function PatientAppointments() {

    const [appointments, setAppointments] = useState([])
    const [activeTab,    setActiveTab]    = useState('upcoming')
    const [loading,      setLoading]      = useState(true)
    const [cancellingId, setCancellingId] = useState(null)

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/appointments/my/')
                setAppointments(response.data)
            } catch (err) {
            } finally {
                setLoading(false)
            }
        }
        fetchAppointments()
    }, [])

    // Filter by tab
    const now      = new Date()
    const upcoming = appointments.filter(a => new Date(a.scheduled_at) > now && a.status !== 'cancelled')
    const past     = appointments.filter(a => new Date(a.scheduled_at) <= now)
    const cancelled = appointments.filter(a => a.status === 'cancelled')

    const displayed = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : cancelled

    // Cancel appointment
    const handleCancel = async (id) => {
        setCancellingId(id)
        try {
            await api.delete(`/appointments/${id}/`)
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
        } catch (err) {
            alert('Failed to cancel appointment')
        } finally {
            setCancellingId(null)
        }
    }

    if (loading) {
        return (
            <Layout title="My Appointments">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="My Appointments">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-green-600">{upcoming.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Upcoming</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-gray-600">{past.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Past</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                    <p className="text-2xl font-bold text-red-500">{cancelled.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Cancelled</p>
                </div>
            </div>

            {/* Main card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">

                {/* Tabs */}
                <div className="flex gap-1 px-5 pt-4 border-b border-gray-100">
                    {['upcoming', 'past', 'cancelled'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium transition ${
                                activeTab === tab
                                    ? 'text-green-600 border-b-2 border-green-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Appointments list */}
                <div className="divide-y divide-gray-50">
                    {displayed.length === 0 && (
                        <div className="px-5 py-10 text-center text-gray-400 text-sm">
                            No {activeTab} appointments
                        </div>
                    )}
                    {displayed.map(appt => (
                        <div key={appt.id} className="px-5 py-4 flex justify-between items-center hover:bg-gray-50">
                            <div>
                                <p className="font-semibold text-gray-700">Dr. {appt.doctor_name}</p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {new Date(appt.scheduled_at).toLocaleString([], {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {appt.department} · {appt.type}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    appt.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                    appt.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    {appt.status}
                                </span>
                                {/* Cancel button only for upcoming */}
                                {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                                    <button onClick={() => handleCancel(appt.id)}
                                        disabled={cancellingId === appt.id}
                                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg disabled:opacity-50">
                                        {cancellingId === appt.id ? '...' : 'Cancel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </Layout>
    )
}

export default PatientAppointments