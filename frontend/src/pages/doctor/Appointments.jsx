// ============================================================
// src/pages/doctor/Appointments.jsx
// ============================================================
// This page shows ALL appointments for the logged-in doctor.
//
// What it shows:
//   1. Stats row — total, today, upcoming, cancelled
//   2. Filter tabs — All / Today / Upcoming / Completed / Cancelled
//   3. Appointments list — each with patient name, time, type, status
//   4. Cancel button on each scheduled appointment
//
// API calls:
//   GET    /api/appointments/my/  → all doctor appointments
//   DELETE /api/appointments/:id/ → cancel an appointment
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


// ============================================================
// STATUS BADGE
// ============================================================
function StatusBadge({ status }) {
    const colors = {
        scheduled: 'bg-blue-100 text-blue-700 border border-blue-200',
        confirmed: 'bg-green-100 text-green-700 border border-green-200',
        cancelled: 'bg-red-100 text-red-700 border border-red-200',
        completed: 'bg-gray-100 text-gray-600 border border-gray-200',
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || ''}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    )
}


// ============================================================
// TYPE BADGE
// ============================================================
function TypeBadge({ type }) {
    const colors = {
        consultation: 'bg-purple-100 text-purple-700',
        followup:     'bg-blue-100 text-blue-700',
        lab:          'bg-yellow-100 text-yellow-700',
        surgery:      'bg-red-100 text-red-700',
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[type] || ''}`}>
            {type?.charAt(0).toUpperCase() + type?.slice(1)}
        </span>
    )
}


// ============================================================
// MAIN COMPONENT
// ============================================================
function DoctorAppointments() {

    // ── STATE ─────────────────────────────────────────────────
    const [appointments, setAppointments] = useState([])
    const [filtered,     setFiltered]     = useState([])

    // activeTab controls which filter is selected
    // 'all' | 'today' | 'upcoming' | 'completed' | 'cancelled'
    const [activeTab,    setActiveTab]    = useState('all')

    const [loading,      setLoading]      = useState(true)
    const [error,        setError]        = useState('')

    // cancellingId → ID of appointment being cancelled right now
    // Used to show loading state on the specific cancel button
    const [cancellingId, setCancellingId] = useState(null)


    // ── FETCH APPOINTMENTS ────────────────────────────────────
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/appointments/my/')
                setAppointments(response.data)
                setFiltered(response.data)
            } catch (err) {
                setError('Failed to load appointments')
            } finally {
                setLoading(false)
            }
        }
        fetchAppointments()
    }, [])


    // ── FILTER LOGIC ──────────────────────────────────────────
    // Runs every time activeTab or appointments changes
    useEffect(() => {
        const today = new Date().toDateString()
        const now   = new Date()

        let result = appointments

        if (activeTab === 'today') {
            // Only appointments scheduled for today
            result = appointments.filter(a =>
                new Date(a.scheduled_at).toDateString() === today
            )
        } else if (activeTab === 'upcoming') {
            // Appointments in the future that are not cancelled
            result = appointments.filter(a =>
                new Date(a.scheduled_at) > now &&
                a.status !== 'cancelled'
            )
        } else if (activeTab === 'completed') {
            result = appointments.filter(a => a.status === 'completed')
        } else if (activeTab === 'cancelled') {
            result = appointments.filter(a => a.status === 'cancelled')
        }
        // 'all' → no filter, show everything

        setFiltered(result)
    }, [activeTab, appointments])


    // ── CANCEL APPOINTMENT ────────────────────────────────────
    // Called when doctor clicks Cancel on an appointment
    // Sets status = 'cancelled' in DB (doesn't delete)
    const handleCancel = async (appointmentId) => {

        // Show loading on this specific button
        setCancellingId(appointmentId)

        try {
            await api.delete(`/appointments/${appointmentId}/`)

            // Update local state immediately without re-fetching
            // Find the appointment and change its status to cancelled
            setAppointments(prev =>
                prev.map(a =>
                    a.id === appointmentId
                        ? { ...a, status: 'cancelled' }
                        : a
                )
            )
        } catch (err) {
            alert('Failed to cancel appointment')
        } finally {
            setCancellingId(null)
        }
    }


    // ── COMPUTED STATS ────────────────────────────────────────
    const today      = new Date().toDateString()
    const now        = new Date()
    const todayCount = appointments.filter(a =>
        new Date(a.scheduled_at).toDateString() === today
    ).length
    const upcomingCount = appointments.filter(a =>
        new Date(a.scheduled_at) > now && a.status !== 'cancelled'
    ).length
    const cancelledCount = appointments.filter(a =>
        a.status === 'cancelled'
    ).length


    // ── LOADING STATE ─────────────────────────────────────────
    if (loading) {
        return (
            <Layout title="Appointments">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </Layout>
        )
    }

    // ── ERROR STATE ───────────────────────────────────────────
    if (error) {
        return (
            <Layout title="Appointments">
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
        <Layout title="Appointments">

            {/* ── STATS ROW ────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

                {/* Total */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
                    <p className="text-2xl font-bold text-gray-700 mt-1">{appointments.length}</p>
                </div>

                {/* Today */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Today</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{todayCount}</p>
                </div>

                {/* Upcoming */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Upcoming</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{upcomingCount}</p>
                </div>

                {/* Cancelled */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Cancelled</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">{cancelledCount}</p>
                </div>
            </div>


            {/* ── MAIN CARD ─────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">

                {/* ── FILTER TABS ──────────────────────────────────── */}
                <div className="flex gap-1 px-5 pt-4 border-b border-gray-100">
                    {['all', 'today', 'upcoming', 'completed', 'cancelled'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-t-lg transition
                                ${activeTab === tab
                                    // Active tab → blue underline
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    // Inactive tab
                                    : 'text-gray-500 hover:text-gray-700'
                                }
                            `}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ── APPOINTMENTS LIST ─────────────────────────────── */}
                <div className="divide-y divide-gray-50">

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div className="px-5 py-10 text-center text-gray-400 text-sm">
                            No appointments found
                        </div>
                    )}

                    {/* Appointment rows */}
                    {filtered.map(appt => (
                        <div
                            key={appt.id}
                            className="px-5 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex justify-between items-start">

                                {/* ── Left side: info ───────────────── */}
                                <div className="flex gap-4">

                                    {/* Date/time block */}
                                    <div className="bg-blue-50 rounded-lg px-3 py-2 text-center min-w-16">
                                        {/* Day number */}
                                        <p className="text-lg font-bold text-blue-700">
                                            {new Date(appt.scheduled_at).getDate()}
                                        </p>
                                        {/* Month abbreviation */}
                                        <p className="text-xs text-blue-500">
                                            {new Date(appt.scheduled_at).toLocaleString('default', { month: 'short' })}
                                        </p>
                                    </div>

                                    {/* Appointment details */}
                                    <div>
                                        {/* Patient name */}
                                        <p className="font-semibold text-gray-700">
                                            {appt.patient_name}
                                        </p>

                                        {/* Time + department */}
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {new Date(appt.scheduled_at).toLocaleTimeString([], {
                                                hour:   '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {' · '}{appt.department}
                                        </p>

                                        {/* Badges row */}
                                        <div className="flex gap-2 mt-1.5">
                                            <TypeBadge   type={appt.type} />
                                            <StatusBadge status={appt.status} />
                                        </div>

                                        {/* Notes if any */}
                                        {appt.notes && (
                                            <p className="text-xs text-gray-400 mt-1 italic">
                                                "{appt.notes}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* ── Right side: cancel button ──────── */}
                                {/* Only show cancel for scheduled/confirmed appointments */}
                                {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                                    <button
                                        onClick={() => handleCancel(appt.id)}
                                        disabled={cancellingId === appt.id}
                                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                                    >
                                        {cancellingId === appt.id ? 'Cancelling...' : 'Cancel'}
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

export default DoctorAppointments
