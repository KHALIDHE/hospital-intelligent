// ============================================================
// src/components/NotificationBell.jsx — HOSPITAL REDESIGN
// ============================================================
// Bell icon in the navbar that shows unread notifications.
//
// Features:
//   - Red badge with unread count
//   - Click to open dropdown list
//   - Click notification → marks it as read
//   - Click outside → closes dropdown
//   - Auto-polls every 30 seconds
//
// API:
//   GET /api/notifications/         → list of notifications
//   PUT /api/notifications/:id/read/ → mark one as read
// ============================================================

import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

function NotificationBell() {

    // ── State ─────────────────────────────────────────────────
    const [notifications, setNotifications] = useState([])
    const [open,          setOpen]          = useState(false)
    const dropdownRef                       = useRef(null)

    // Count unread notifications for the badge
    const unreadCount = notifications.filter(n => !n.is_read).length


    // ── Fetch notifications ───────────────────────────────────
    // Called on mount and every 30 seconds
    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/')
            setNotifications(res.data)
        } catch (err) {
            // Silent fail — notifications are not critical
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)  // cleanup on unmount
    }, [])


    // ── Close dropdown when clicking outside ──────────────────
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])


    // ── Mark notification as read ─────────────────────────────
    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read/`)
            // Update local state — no need to refetch
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
        } catch (err) {}
    }


    return (
        // ── Relative container for dropdown positioning ────────
        <div className="relative" ref={dropdownRef}>

            {/* ── Bell button ───────────────────────────────────── */}
            <button
                onClick={() => setOpen(!open)}
                className="relative w-9 h-9 flex items-center justify-center
                    rounded-xl text-slate-500 hover:text-slate-700
                    hover:bg-slate-100 transition-all"
            >
                {/* Bell icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* ── Unread count badge ───────────────────────────
                    Only shown when there are unread notifications  */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1
                        bg-red-500 text-white text-xs font-bold
                        w-4 h-4 rounded-full flex items-center justify-center
                        leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>


            {/* ── Dropdown panel ────────────────────────────────── */}
            {open && (
                <div className="absolute right-0 top-11 w-80 z-50
                    bg-white rounded-2xl shadow-xl border border-slate-100
                    overflow-hidden fade-in">

                    {/* ── Dropdown header ─────────────────────── */}
                    <div className="px-4 py-3 border-b border-slate-100
                        flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-700">
                            Notifications
                        </h3>
                        {/* Unread count */}
                        {unreadCount > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs
                                font-semibold px-2 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    {/* ── Notification list ───────────────────── */}
                    <div className="max-h-72 overflow-y-auto">

                        {notifications.length === 0 ? (
                            // Empty state
                            <div className="py-10 text-center">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl
                                    flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                                    </svg>
                                </div>
                                <p className="text-sm text-slate-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    className={`w-full text-left px-4 py-3
                                        border-b border-slate-50 last:border-0
                                        hover:bg-slate-50 transition-colors
                                        ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                                >
                                    <div className="flex items-start gap-3">

                                        {/* Unread indicator dot */}
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5
                                            ${!notification.is_read
                                                ? 'bg-blue-500'    // unread → blue dot
                                                : 'bg-slate-200'   // read → gray dot
                                            }`}>
                                        </div>

                                        {/* Notification content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs leading-relaxed
                                                ${!notification.is_read
                                                    ? 'text-slate-700 font-medium'  // unread → bold
                                                    : 'text-slate-500'              // read → muted
                                                }`}>
                                                {notification.message}
                                            </p>
                                            {/* Timestamp */}
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(notification.created_at)
                                                    .toLocaleString([], {
                                                        month:  'short',
                                                        day:    'numeric',
                                                        hour:   '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    {/* ── Dropdown footer ──────────────────────── */}
                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                        <p className="text-xs text-slate-400 text-center">
                            Click a notification to mark it as read
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell
