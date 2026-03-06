// ============================================================
// src/pages/nurse/Dashboard.jsx
// ============================================================
// First page nurse sees after login.
// Shows: OR beds grid + doctor availability + quick stats
//
// API calls:
//   GET /api/nurse/or-beds/        → all OR beds with status
//   GET /api/nurse/doctor-status/  → which doctors are free/busy
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


// ── BED STATUS CARD ───────────────────────────────────────────
// Shows a single OR bed with color based on status
function BedCard({ bed }) {
    const colors = {
        available:   'bg-green-50 border-green-200',
        occupied:    'bg-red-50 border-red-200',
        maintenance: 'bg-yellow-50 border-yellow-200',
    }
    const textColors = {
        available:   'text-green-700',
        occupied:    'text-red-700',
        maintenance: 'text-yellow-700',
    }
    const icons = {
        available:   '🟢',
        occupied:    '🔴',
        maintenance: '🟡',
    }
    return (
        <div className={`rounded-xl border p-4 ${colors[bed.status] || colors.available}`}>
            {/* Room name + icon */}
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">{bed.room_name}</h4>
                <span>{icons[bed.status]}</span>
            </div>
            {/* Status */}
            <p className={`text-sm font-medium ${textColors[bed.status]}`}>
                {bed.status?.charAt(0).toUpperCase() + bed.status?.slice(1)}
            </p>
            {/* Patient name if occupied */}
            {bed.patient_name && (
                <p className="text-xs text-gray-500 mt-1">
                    Patient: {bed.patient_name}
                </p>
            )}
            {/* Surgery times if set */}
            {bed.surgery_start && (
                <p className="text-xs text-gray-400 mt-0.5">
                    Since: {new Date(bed.surgery_start).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                    })}
                </p>
            )}
        </div>
    )
}


function NurseDashboard() {

    const [beds,    setBeds]    = useState([])
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bedsRes, doctorsRes] = await Promise.all([
                    api.get('/nurse/or-beds/'),
                    api.get('/nurse/doctor-status/'),
                ])
                setBeds(bedsRes.data)
                setDoctors(doctorsRes.data)
            } catch (err) {
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Computed stats
    const availableCount   = beds.filter(b => b.status === 'available').length
    const occupiedCount    = beds.filter(b => b.status === 'occupied').length
    const maintenanceCount = beds.filter(b => b.status === 'maintenance').length
    const freeDoctors      = doctors.filter(d => d.status === 'free').length

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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

            {/* Welcome */}
            <div className="bg-teal-700 text-white rounded-xl px-6 py-5 mb-6">
                <h2 className="text-xl font-bold">Welcome back 👋</h2>
                <p className="text-teal-200 text-sm mt-1">Here's your ward overview</p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400">Available Beds</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{availableCount}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400">Occupied Beds</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">{occupiedCount}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400">Maintenance</p>
                    <p className="text-2xl font-bold text-yellow-500 mt-1">{maintenanceCount}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400">Free Doctors</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{freeDoctors}</p>
                </div>
            </div>

            {/* OR Beds grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                <h3 className="font-semibold text-gray-700 mb-4">OR Beds Overview</h3>
                {beds.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No OR beds found</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {beds.map(bed => <BedCard key={bed.id} bed={bed} />)}
                    </div>
                )}
            </div>

            {/* Doctor availability */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-700 mb-4">Doctor Availability</h3>
                <div className="divide-y divide-gray-50">
                    {doctors.length === 0 && (
                        <p className="text-gray-400 text-sm text-center py-4">No doctors found</p>
                    )}
                    {doctors.map(doctor => (
                        <div key={doctor.id} className="py-3 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Dr. {doctor.full_name}</p>
                                <p className="text-xs text-gray-400">{doctor.specialty}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                doctor.status === 'free'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {doctor.status === 'free' ? '🟢 Free' : '🔴 Busy'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </Layout>
    )
}

export default NurseDashboard