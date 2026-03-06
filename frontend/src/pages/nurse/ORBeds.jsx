// ============================================================
// src/pages/nurse/ORBeds.jsx
// ============================================================
// Full OR beds management page.
// Nurse can update bed status, assign patient, set surgery times.
//
// API calls:
//   GET /api/nurse/or-beds/        → list all beds
//   PUT /api/nurse/or-beds/:id/    → update a bed
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function ORBeds() {

    const [beds,       setBeds]       = useState([])
    const [loading,    setLoading]    = useState(true)
    const [error,      setError]      = useState('')

    // editingId → which bed is being edited right now
    const [editingId,  setEditingId]  = useState(null)

    // Edit form fields
    const [editStatus,       setEditStatus]       = useState('')
    const [editSurgeryStart, setEditSurgeryStart] = useState('')
    const [editSurgeryEnd,   setEditSurgeryEnd]   = useState('')
    const [saving,           setSaving]           = useState(false)
    const [saveError,        setSaveError]        = useState('')


    // Fetch all beds
    useEffect(() => {
        const fetchBeds = async () => {
            try {
                const response = await api.get('/nurse/or-beds/')
                setBeds(response.data)
            } catch (err) {
                setError('Failed to load OR beds')
            } finally {
                setLoading(false)
            }
        }
        fetchBeds()
    }, [])


    // Open edit form for a specific bed
    const handleEdit = (bed) => {
        setEditingId(bed.id)
        setEditStatus(bed.status)
        setEditSurgeryStart(bed.surgery_start || '')
        setEditSurgeryEnd(bed.surgery_end     || '')
        setSaveError('')
    }


    // Save bed changes
    const handleSave = async (bedId) => {
        setSaving(true)
        setSaveError('')
        try {
            const response = await api.put(`/nurse/or-beds/${bedId}/`, {
                status:        editStatus,
                surgery_start: editSurgeryStart || null,
                surgery_end:   editSurgeryEnd   || null,
            })
            // Update local state with new data
            setBeds(prev => prev.map(b => b.id === bedId ? response.data : b))
            setEditingId(null)
        } catch (err) {
            setSaveError('Failed to save changes')
        } finally {
            setSaving(false)
        }
    }


    // Status colors
    const statusColors = {
        available:   'bg-green-100 text-green-700 border-green-200',
        occupied:    'bg-red-100 text-red-700 border-red-200',
        maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    }


    if (loading) {
        return (
            <Layout title="OR Beds">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="OR Beds">

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">
                        Operating Room Beds — {beds.length} total
                    </h3>
                </div>

                {error && (
                    <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                        {error}
                    </div>
                )}

                {/* Beds table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-5 py-3 text-left">Room</th>
                                <th className="px-5 py-3 text-left">Department</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Patient</th>
                                <th className="px-5 py-3 text-left">Surgery Start</th>
                                <th className="px-5 py-3 text-left">Surgery End</th>
                                <th className="px-5 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {beds.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                                        No OR beds found
                                    </td>
                                </tr>
                            )}
                            {beds.map(bed => (
                                <tr key={bed.id} className="hover:bg-gray-50">

                                    {/* Room name */}
                                    <td className="px-5 py-3 font-medium text-gray-700">
                                        {bed.room_name}
                                    </td>

                                    {/* Department */}
                                    <td className="px-5 py-3 text-gray-500">
                                        {bed.department}
                                    </td>

                                    {/* Status — editable */}
                                    <td className="px-5 py-3">
                                        {editingId === bed.id ? (
                                            // Edit mode → show select dropdown
                                            <select
                                                value={editStatus}
                                                onChange={(e) => setEditStatus(e.target.value)}
                                                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                                            >
                                                <option value="available">Available</option>
                                                <option value="occupied">Occupied</option>
                                                <option value="maintenance">Maintenance</option>
                                            </select>
                                        ) : (
                                            // View mode → colored badge
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[bed.status]}`}>
                                                {bed.status?.charAt(0).toUpperCase() + bed.status?.slice(1)}
                                            </span>
                                        )}
                                    </td>

                                    {/* Patient */}
                                    <td className="px-5 py-3 text-gray-500">
                                        {bed.patient_name || '—'}
                                    </td>

                                    {/* Surgery start — editable */}
                                    <td className="px-5 py-3 text-gray-500">
                                        {editingId === bed.id ? (
                                            <input
                                                type="datetime-local"
                                                value={editSurgeryStart}
                                                onChange={(e) => setEditSurgeryStart(e.target.value)}
                                                className="border border-gray-300 rounded-lg px-2 py-1 text-xs"
                                            />
                                        ) : (
                                            bed.surgery_start
                                                ? new Date(bed.surgery_start).toLocaleString()
                                                : '—'
                                        )}
                                    </td>

                                    {/* Surgery end — editable */}
                                    <td className="px-5 py-3 text-gray-500">
                                        {editingId === bed.id ? (
                                            <input
                                                type="datetime-local"
                                                value={editSurgeryEnd}
                                                onChange={(e) => setEditSurgeryEnd(e.target.value)}
                                                className="border border-gray-300 rounded-lg px-2 py-1 text-xs"
                                            />
                                        ) : (
                                            bed.surgery_end
                                                ? new Date(bed.surgery_end).toLocaleString()
                                                : '—'
                                        )}
                                    </td>

                                    {/* Action buttons */}
                                    <td className="px-5 py-3">
                                        {editingId === bed.id ? (
                                            // Edit mode → Save + Cancel
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSave(bed.id)}
                                                    disabled={saving}
                                                    className="bg-teal-600 text-white px-3 py-1 rounded-lg text-xs disabled:opacity-50"
                                                >
                                                    {saving ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            // View mode → Edit button
                                            <button
                                                onClick={() => handleEdit(bed)}
                                                className="bg-teal-50 hover:bg-teal-100 text-teal-600 px-3 py-1 rounded-lg text-xs"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Save error */}
                {saveError && (
                    <div className="mx-5 mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                        {saveError}
                    </div>
                )}
            </div>

        </Layout>
    )
}

export default ORBeds