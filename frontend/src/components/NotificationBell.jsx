// ============================================================
// src/components/NotificationBell.jsx
// ============================================================
// The bell icon in the Navbar that shows unread notifications.
//
// What it does:
//   1. Calls GET /api/notifications/ on mount to get notifications
//   2. Shows a red badge with unread count if any unread exist
//   3. When clicked → opens a dropdown list of notifications
//   4. Clicking a notification → marks it as read
//   5. Auto-refreshes every 30 seconds to check for new notifications
//
// Used inside Navbar.jsx — no need to use it directly in pages
// ============================================================

import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'


function NotificationBell() {

    // ── STATE ─────────────────────────────────────────────────
    // notifications → array of notification objects from API
    const [notifications, setNotifications] = useState([])

    // open → controls whether the dropdown is visible or hidden
    const [open, setOpen]                   = useState(false)

    // ref → used to detect clicks OUTSIDE the dropdown
    // so we can close it when user clicks elsewhere
    const dropdownRef = useRef(null)


    // ── FETCH NOTIFICATIONS ───────────────────────────────────
    // Calls GET /api/notifications/ to get all notifications
    // for the currently logged-in user
    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications/')
            setNotifications(response.data)
        } catch (error) {
            // Silently fail — bell just shows 0 if API fails
        }
    }


    // ── ON MOUNT + AUTO REFRESH ───────────────────────────────
    // Fetch immediately when component loads
    // Then fetch again every 30 seconds automatically
    // This way new notifications appear without page refresh
    useEffect(() => {

        // Fetch immediately on mount
        fetchNotifications()

        // Set up auto-refresh every 30 seconds
        // setInterval returns an ID we can use to cancel it
        const interval = setInterval(fetchNotifications, 30000)

        // Cleanup: cancel the interval when component unmounts
        // Without this, the interval keeps running forever
        return () => clearInterval(interval)

    }, []) // ← empty array = run once on mount


    // ── CLOSE DROPDOWN ON OUTSIDE CLICK ──────────────────────
    // When user clicks anywhere outside the dropdown → close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            // dropdownRef.current = the dropdown DOM element
            // contains() checks if the click was inside or outside
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        // Listen for clicks on the entire document
        document.addEventListener('mousedown', handleClickOutside)

        // Cleanup: remove listener when component unmounts
        return () => document.removeEventListener('mousedown', handleClickOutside)

    }, [])


    // ── MARK AS READ ──────────────────────────────────────────
    // Called when user clicks a notification
    // Calls PUT /api/notifications/:id/read/ → sets is_read=true
    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read/`)

            // Update local state immediately without waiting for re-fetch
            // Map through notifications and flip is_read for this one
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, is_read: true }  // update this one
                        : n                          // keep others unchanged
                )
            )
        } catch (error) {
            // Silently fail
        }
    }


    // ── COUNT UNREAD ──────────────────────────────────────────
    // Filter notifications where is_read = false
    // The length of that array = unread count
    const unreadCount = notifications.filter(n => !n.is_read).length


    // ── PRIORITY COLORS ───────────────────────────────────────
    // Different colors for different priority levels
    const priorityColors = {
        urgent: 'bg-red-100 border-red-300 text-red-800',
        high:   'bg-orange-100 border-orange-300 text-orange-800',
        medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        low:    'bg-gray-100 border-gray-300 text-gray-800',
    }


    // ============================================================
    // RENDER
    // ============================================================
    return (
        // ── Container — relative so dropdown positions correctly ─
        <div className="relative" ref={dropdownRef}>

            {/* ── Bell button ───────────────────────────────────── */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
                {/* Bell icon */}
                <span className="text-xl">🔔</span>

                {/* ── Unread badge ───────────────────────────────── */}
                {/* Only shown if there are unread notifications */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {/* Show 9+ if more than 9 unread */}
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown ──────────────────────────────────────── */}
            {/* Only rendered when open = true */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">

                    {/* Dropdown header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-gray-400">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    {/* ── Notification list ─────────────────────── */}
                    <div className="max-h-80 overflow-y-auto">

                        {/* Empty state */}
                        {notifications.length === 0 && (
                            <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                No notifications yet
                            </div>
                        )}

                        {/* Loop through notifications */}
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => markAsRead(notif.id)}
                                className={`
                                    px-4 py-3 border-b border-gray-50 cursor-pointer
                                    hover:bg-gray-50 transition-colors
                                    ${!notif.is_read ? 'bg-blue-50' : ''}
                                `}
                            >
                                {/* Priority badge + message */}
                                <div className={`text-xs px-2 py-0.5 rounded-full inline-block mb-1 border ${priorityColors[notif.priority] || priorityColors.low}`}>
                                    {notif.priority?.toUpperCase()}
                                </div>

                                {/* Message text */}
                                <p className="text-sm text-gray-700 mt-1">
                                    {notif.message}
                                </p>

                                {/* Sender + time */}
                                <p className="text-xs text-gray-400 mt-1">
                                    {notif.sender_name} · {new Date(notif.created_at).toLocaleString()}
                                </p>

                                {/* Unread dot */}
                                {!notif.is_read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full absolute right-4 top-4"></div>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    )
}

export default NotificationBell