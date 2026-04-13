// ============================================================
// src/pages/nurse/RoomStatus.jsx
// ============================================================
// Nurse picks a department → sees 20 room cards colored by
// status → clicks a card → modal opens → sets new status.
//
// API calls:
//   GET   /api/nurse/rooms/?department=X  → load rooms
//   PATCH /api/nurse/rooms/:id/           → update status
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


// ── Status → colors (matches 3D building colors) ─────────────
const STATUS_STYLES = {
    empty:       'bg-[#00FF00] text-white border-[#00FF00]',
    stable:      'bg-[#0088FF] text-white border-[#0088FF]',
    critical:    'bg-[#FF0000] text-white border-[#FF0000]',
    maintenance: 'bg-[#FFB800] text-white border-[#FFB800]',
}

const STATUS_DOT = {
    empty:       'bg-white',
    stable:      'bg-white',
    critical:    'bg-white',
    maintenance: 'bg-white',
}

// ── 12 departments (must match Django DEPARTMENT_CHOICES) ─────
const DEPARTMENTS = [
    { value: 'urgences',          label: 'Urgences'          },
    { value: 'cardiologie',       label: 'Cardiologie'       },
    { value: 'chirurgie',         label: 'Chirurgie'         },
    { value: 'pediatrie',         label: 'Pédiatrie'         },
    { value: 'neurologie',        label: 'Neurologie'        },
    { value: 'orthopédie',        label: 'Orthopédie'        },
    { value: 'gynécologie',       label: 'Gynécologie'       },
    { value: 'réanimation',       label: 'Réanimation'       },
    { value: 'oncologie',         label: 'Oncologie'         },
    { value: 'pneumologie',       label: 'Pneumologie'       },
    { value: 'gastroentérologie', label: 'Gastroentérologie' },
    { value: 'dermatologie',      label: 'Dermatologie'      },
]


function RoomStatus() {

    // ── State ──────────────────────────────────────────────────
    const [selectedDept, setSelectedDept] = useState(null)
    const [rooms,        setRooms]        = useState([])
    const [loading,      setLoading]      = useState(false)
    const [error,        setError]        = useState('')

    // Modal state — which room is being edited
    const [modalRoom,    setModalRoom]    = useState(null)
    const [newStatus,    setNewStatus]    = useState('')
    const [saving,       setSaving]       = useState(false)
    const [saveError,    setSaveError]    = useState('')


    // ── Fetch rooms when department is selected ────────────────
    useEffect(() => {
        if (!selectedDept) return

        const fetchRooms = async () => {
            setLoading(true)
            setError('')
            try {
                const res = await api.get(`/nurse/rooms/?department=${selectedDept}`)
                setRooms(res.data)
            } catch (err) {
                setError('Failed to load rooms')
            } finally {
                setLoading(false)
            }
        }

        fetchRooms()
    }, [selectedDept])


    // ── Open modal for a room ──────────────────────────────────
    const handleCardClick = (room) => {
        setModalRoom(room)
        setNewStatus(room.status)
        setSaveError('')
    }


    // ── Save new status via PATCH ──────────────────────────────
    const handleSave = async () => {
        setSaving(true)
        setSaveError('')
        try {
            const res = await api.patch(`/nurse/rooms/${modalRoom.id}/`, {
                status: newStatus,
            })
            // Update the card color instantly without refetching
            setRooms(prev => prev.map(r => r.id === modalRoom.id ? res.data : r))
            setModalRoom(null)
        } catch (err) {
            setSaveError('Failed to save. Please try again.')
        } finally {
            setSaving(false)
        }
    }


    // ── Stats for the selected department ──────────────────────
    const stats = {
        empty:       rooms.filter(r => r.status === 'empty').length,
        stable:      rooms.filter(r => r.status === 'stable').length,
        critical:    rooms.filter(r => r.status === 'critical').length,
        maintenance: rooms.filter(r => r.status === 'maintenance').length,
    }


    return (
        <Layout title="Room Status">

            {/* ── STEP 1 : Department selector ─────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">

                <h3 className="font-semibold text-gray-700 mb-4">
                    Select a department
                </h3>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {DEPARTMENTS.map(dept => (
                        <button
                            key={dept.value}
                            onClick={() => {
                                setSelectedDept(dept.value)
                                setRooms([])
                            }}
                            className={`
                                px-3 py-2 rounded-lg text-sm font-medium border transition-all
                                ${selectedDept === dept.value
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-600'
                                }
                            `}
                        >
                            {dept.label}
                        </button>
                    ))}
                </div>
            </div>


            {/* ── STEP 2 : Rooms grid (shown after dept selected) ── */}
            {selectedDept && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Header + stats */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">

                        <h3 className="font-semibold text-gray-700">
                            {DEPARTMENTS.find(d => d.value === selectedDept)?.label} — {rooms.length} rooms
                        </h3>

                        {/* Mini stats */}
                        <div className="flex gap-3 text-xs">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>
                                <span className="text-gray-500">Empty: {stats.empty}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"/>
                                <span className="text-gray-500">Stable: {stats.stable}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>
                                <span className="text-gray-500">Critical: {stats.critical}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"/>
                                <span className="text-gray-500">Maintenance: {stats.maintenance}</span>
                            </span>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center h-40">
                            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"/>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="m-5 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Room cards grid */}
                    {!loading && !error && (
                        <div className="p-5 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-10">
                            {rooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => handleCardClick(room)}
                                    className={`
                                        border-2 rounded-xl p-3 text-center cursor-pointer
                                        transition-all hover:scale-105 hover:shadow-md
                                        ${STATUS_STYLES[room.status]}
                                    `}
                                >
                                    {/* Status dot */}
                                    <div className="flex justify-center mb-1">
                                        <span className={`w-2 h-2 rounded-full ${STATUS_DOT[room.status]}`}/>
                                    </div>

                                    {/* Room number */}
                                    <div className="text-xs font-semibold">
                                        {room.room_number}
                                    </div>

                                    {/* Status label */}
                                    <div className="text-xs opacity-75 mt-0.5 capitalize">
                                        {room.status}
                                    </div>
                                </button>
                            ))}

                            {rooms.length === 0 && !loading && (
                                <div className="col-span-10 py-10 text-center text-gray-400 text-sm">
                                    No rooms found for this department
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}


            {/* ── MODAL : Status picker ─────────────────────── */}
            {modalRoom && (
                // Backdrop
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setModalRoom(null)}
                >
                    {/* Modal box — stop click propagation so backdrop click closes */}
                    <div
                        className="bg-white rounded-2xl shadow-xl p-6 w-80"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Room title */}
                        <h4 className="font-semibold text-gray-800 text-base mb-1">
                            Room {modalRoom.room_number}
                        </h4>
                        <p className="text-gray-400 text-xs mb-5">
                            {DEPARTMENTS.find(d => d.value === selectedDept)?.label} · Floor {modalRoom.floor}
                        </p>

                        {/* Status buttons */}
                        <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
                            Set status
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            {['empty', 'stable', 'critical', 'maintenance'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setNewStatus(s)}
                                    className={`
                                        border-2 rounded-xl py-2 text-sm font-medium capitalize transition-all
                                        ${newStatus === s
                                            ? STATUS_STYLES[s] + ' scale-105'
                                            : 'border-gray-200 text-gray-400 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${STATUS_DOT[s]}`}/>
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Save error */}
                        {saveError && (
                            <p className="text-red-500 text-xs mb-3">{saveError}</p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => setModalRoom(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium"
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

export default RoomStatus