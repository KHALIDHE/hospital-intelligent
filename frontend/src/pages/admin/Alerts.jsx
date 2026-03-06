// ============================================================
// src/pages/admin/Alerts.jsx
// ============================================================
// Admin sees all hospital notifications/alerts.
// Can filter by priority, mark as read.
//
// API calls:
//   GET /api/notifications/ → all notifications for admin
//   PUT /api/notifications/:id/read/ → mark as read
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function AdminAlerts() {

    const [alerts,       setAlerts]       = useState([])
    const [filtered,     setFiltered]     = useState([])
    const [priorityFilter, setPriorityFilter] = useState('all')
    const [loading,      setLoading]      = useState(true)
    const [error,        setError]        = useState('')

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const response = await api.get('/notifications/')
                setAlerts(response.data)
                setFiltered(response.data)
            } catch (err) {
                setError('Failed to load alerts')
            } finally {
                setLoading(false)
            }
        }
        fetchAlerts()
    }, [])

    // Filter by priority
    useEffect(() => {
        if (priorityFilter === 'all') {
            setFiltered(alerts)
        } else {
            setFiltered(alerts.filter(a => a.priority === priorityFilter))
        }
    }, [priorityFilter, alerts])

    // Mark single alert as read
    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read/`)
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
        } catch (err) {}
    }

    // Mark ALL as read
    const markAllAsRead = async () => {
        try {
            const unread = alerts.filter(a => !a.is_read)
            await Promise.all(unread.map(a => api.put(`/notifications/${a.id}/read/`)))
            setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
        } catch (err) {}
    }

    const priorityColors = {
        urgent: 'bg-red-100 border-red-300 text-red-800',
        high:   'bg-orange-100 border-orange-300 text-orange-800',
        medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        low:    'bg-gray-100 border-gray-300 text-gray-600',
    }

    const unreadCount = alerts.filter(a => !a.is_read).length

    if (loading) {
        return (
            <Layout title="Alerts">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Alerts">

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-700">Hospital Alerts</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{unreadCount} unread alerts</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Priority filter */}
            <div className="flex gap-2 mb-5">
                {['all', 'urgent', 'high', 'medium', 'low'].map(p => (
                    <button key={p} onClick={() => setPriorityFilter(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            priorityFilter === p ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                ))}
            </div>

            {error && <div className="bg-red-50 text-red-600 rounded-lg p-4 mb-4">{error}</div>}

            {/* Alerts list */}
            <div className="space-y-3">
                {filtered.length === 0 && (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">
                        No alerts found
                    </div>
                )}
                {filtered.map(alert => (
                    <div key={alert.id}
                        className={`bg-white rounded-xl border p-4 flex justify-between items-start ${
                            !alert.is_read ? 'border-l-4 border-l-purple-500' : 'border-gray-100'
                        }`}>
                        <div className="flex-1">
                            {/* Priority badge */}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[alert.priority] || priorityColors.low}`}>
                                {alert.priority?.toUpperCase()}
                            </span>
                            {/* Message */}
                            <p className="text-sm text-gray-700 mt-2">{alert.message}</p>
                            {/* Sender + time */}
                            <p className="text-xs text-gray-400 mt-1">
                                From: {alert.sender_name || 'System'} ·{' '}
                                {new Date(alert.created_at).toLocaleString()}
                            </p>
                        </div>
                        {/* Mark as read button */}
                        {!alert.is_read && (
                            <button onClick={() => markAsRead(alert.id)}
                                className="ml-4 text-xs text-purple-600 hover:underline whitespace-nowrap">
                                Mark read
                            </button>
                        )}
                    </div>
                ))}
            </div>

        </Layout>
    )
}

export default AdminAlerts