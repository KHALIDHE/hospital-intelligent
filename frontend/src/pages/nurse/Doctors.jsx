// ============================================================
// src/pages/nurse/Doctors.jsx
// ============================================================
// Shows all doctors with their current status (Free/Busy).
// Nurse can send a priority notification to any doctor.
//
// API calls:
//   GET  /api/nurse/doctor-status/  → doctors + free/busy status
//   POST /api/nurse/notify-doctor/  → send notification to doctor
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function DoctorsAvailability() {

    const [doctors,  setDoctors]  = useState([])
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState('')

    // Notification modal state
    // notifyDoctor → the doctor we're sending a notification to
    const [notifyDoctor,  setNotifyDoctor]  = useState(null)
    const [message,       setMessage]       = useState('')
    const [priority,      setPriority]      = useState('medium')
    const [sending,       setSending]       = useState(false)
    const [sendSuccess,   setSendSuccess]   = useState(false)
    const [sendError,     setSendError]     = useState('')


    // Fetch doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/nurse/doctor-status/')
                setDoctors(response.data)
            } catch (err) {
                setError('Failed to load doctors')
            } finally {
                setLoading(false)
            }
        }
        fetchDoctors()
    }, [])


    // Send notification to doctor
    const handleSendNotification = async () => {
        if (!message.trim()) return
        setSending(true)
        setSendError('')
        setSendSuccess(false)

        try {
            await api.post('/nurse/notify-doctor/', {
                doctor_id: notifyDoctor.id,
                message:   message,
                priority:  priority,
            })
            setSendSuccess(true)
            setMessage('')
            // Close modal after 1.5 seconds
            setTimeout(() => {
                setNotifyDoctor(null)
                setSendSuccess(false)
            }, 1500)
        } catch (err) {
            setSendError('Failed to send notification')
        } finally {
            setSending(false)
        }
    }


    if (loading) {
        return (
            <Layout title="Doctors">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Doctors">

            {/* Doctors list */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">

                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">
                        All Doctors — {doctors.length} total
                    </h3>
                </div>

                {error && (
                    <div className="mx-5 mt-4 bg-red-50 text-red-600 rounded-lg p-3 text-sm">{error}</div>
                )}

                <div className="divide-y divide-gray-50">
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="px-5 py-4 flex justify-between items-center hover:bg-gray-50">

                            {/* Doctor info */}
                            <div>
                                <p className="font-medium text-gray-700">Dr. {doctor.full_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{doctor.specialty}</p>
                                {/* If busy — show what they're doing */}
                                {doctor.current_appointment && (
                                    <p className="text-xs text-red-500 mt-0.5">
                                        In {doctor.current_appointment.type} with {doctor.current_appointment.patient}
                                    </p>
                                )}
                            </div>

                            {/* Right side: status + notify button */}
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    doctor.status === 'free'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {doctor.status === 'free' ? '🟢 Free' : '🔴 Busy'}
                                </span>

                                {/* Notify button → opens modal */}
                                <button
                                    onClick={() => {
                                        setNotifyDoctor(doctor)
                                        setMessage('')
                                        setPriority('medium')
                                        setSendSuccess(false)
                                        setSendError('')
                                    }}
                                    className="bg-teal-50 hover:bg-teal-100 text-teal-600 px-3 py-1.5 rounded-lg text-xs font-medium"
                                >
                                    🔔 Notify
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* ── NOTIFICATION MODAL ───────────────────────────── */}
            {/* Only shown when notifyDoctor is set */}
            {notifyDoctor && (
                // Dark overlay behind the modal
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

                    {/* Modal box */}
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">

                        {/* Modal header */}
                        <h3 className="font-semibold text-gray-700 mb-1">
                            Send Notification
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            To: Dr. {notifyDoctor.full_name}
                        </p>

                        {/* Priority selector */}
                        <div className="mb-3">
                            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">🚨 Urgent</option>
                            </select>
                        </div>

                        {/* Message textarea */}
                        <div className="mb-4">
                            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                                Message
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message to the doctor..."
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                        </div>

                        {/* Success message */}
                        {sendSuccess && (
                            <div className="bg-green-50 text-green-600 rounded-lg p-2 text-sm mb-3">
                                ✅ Notification sent!
                            </div>
                        )}

                        {/* Error message */}
                        {sendError && (
                            <div className="bg-red-50 text-red-600 rounded-lg p-2 text-sm mb-3">
                                {sendError}
                            </div>
                        )}

                        {/* Modal buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSendNotification}
                                disabled={sending || !message.trim()}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : 'Send Notification'}
                            </button>
                            <button
                                onClick={() => setNotifyDoctor(null)}
                                className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </Layout>
    )
}

export default DoctorsAvailability