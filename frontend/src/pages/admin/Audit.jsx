// ============================================================
// src/pages/admin/Audit.jsx
// ============================================================
// Admin sees the audit log — who did what and when.
// For now shows all appointments as an activity log
// since we don't have a dedicated audit model yet.
//
// API calls:
//   GET /api/appointments/all/ → used as activity log
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function AdminAudit() {

    const [logs,     setLogs]     = useState([])
    const [filtered, setFiltered] = useState([])
    const [search,   setSearch]   = useState('')
    const [loading,  setLoading]  = useState(true)
    const [error,    setError]    = useState('')

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Using appointments as activity log for now
                const response = await api.get('/appointments/all/')
                setLogs(response.data)
                setFiltered(response.data)
            } catch (err) {
                setError('Failed to load audit logs')
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [])

    // Search filter
    useEffect(() => {
        if (!search.trim()) {
            setFiltered(logs)
            return
        }
        setFiltered(logs.filter(l =>
            l.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
            l.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
            l.department?.toLowerCase().includes(search.toLowerCase())
        ))
    }, [search, logs])

    if (loading) {
        return (
            <Layout title="Audit Logs">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Audit Logs">

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-700">Audit Log</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{logs.length} total records</p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-5">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by patient, doctor, or department..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>

            {error && <div className="bg-red-50 text-red-600 rounded-lg p-4 mb-4">{error}</div>}

            {/* Log table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-5 py-3 text-left">Date & Time</th>
                            <th className="px-5 py-3 text-left">Action</th>
                            <th className="px-5 py-3 text-left">Patient</th>
                            <th className="px-5 py-3 text-left">Doctor</th>
                            <th className="px-5 py-3 text-left">Department</th>
                            <th className="px-5 py-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No records found</td></tr>
                        )}
                        {filtered.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-5 py-3 text-gray-500 text-xs">
                                    {new Date(log.scheduled_at).toLocaleString()}
                                </td>
                                <td className="px-5 py-3">
                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                                        Appointment — {log.type}
                                    </span>
                                </td>
                                <td className="px-5 py-3 font-medium text-gray-700">{log.patient_name}</td>
                                <td className="px-5 py-3 text-gray-500">Dr. {log.doctor_name}</td>
                                <td className="px-5 py-3 text-gray-500">{log.department}</td>
                                <td className="px-5 py-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        log.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                        log.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                        log.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </Layout>
    )
}

export default AdminAudit