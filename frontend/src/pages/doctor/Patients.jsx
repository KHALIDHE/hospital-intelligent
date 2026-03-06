// ============================================================
// src/pages/doctor/Patients.jsx
// ============================================================
// This page shows ALL patients assigned to the logged-in doctor.
//
// What it shows:
//   - Searchable list of all assigned patients
//   - Filter by status (All / Stable / Alert / Critical)
//   - Each patient row has a "View" button → goes to PatientDetail
//
// API calls:
//   GET /api/doctors/my-patients/ → returns all assigned patients
//
// Navigation:
//   Click "View" → goes to /doctor/patients/:id
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import Layout                  from '../../components/Layout'
import api                     from '../../api/axios'


// ============================================================
// STATUS BADGE COMPONENT
// Reusable colored badge for patient status
// ============================================================
function StatusBadge({ status }) {
    const colors = {
        stable:   'bg-green-100 text-green-700 border border-green-200',
        alert:    'bg-yellow-100 text-yellow-700 border border-yellow-200',
        critical: 'bg-red-100 text-red-700 border border-red-200',
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.stable}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    )
}


// ============================================================
// MAIN COMPONENT
// ============================================================
function DoctorPatients() {

    const navigate = useNavigate()

    // ── STATE ─────────────────────────────────────────────────
    // patients      → full list from API (never filtered)
    // filtered      → what's currently shown after search/filter
    // search        → text typed in the search box
    // statusFilter  → selected status filter (all/stable/alert/critical)
    // loading       → show spinner while fetching
    // error         → show error message if API fails
    const [patients,     setPatients]     = useState([])
    const [filtered,     setFiltered]     = useState([])
    const [search,       setSearch]       = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [loading,      setLoading]      = useState(true)
    const [error,        setError]        = useState('')


    // ── FETCH PATIENTS ON MOUNT ───────────────────────────────
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/doctors/my-patients/')
                setPatients(response.data)
                setFiltered(response.data) // show all by default
            } catch (err) {
                setError('Failed to load patients')
            } finally {
                setLoading(false)
            }
        }
        fetchPatients()
    }, [])


    // ── FILTER LOGIC ──────────────────────────────────────────
    // Runs every time search text OR status filter changes
    // Filters the original patients array and updates filtered
    useEffect(() => {
        let result = patients

        // Apply status filter first
        // If 'all' → keep everything
        // Otherwise → only keep patients matching the status
        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter)
        }

        // Apply search filter on top
        // Search by name OR patient code (case insensitive)
        if (search.trim()) {
            result = result.filter(p =>
                p.full_name.toLowerCase().includes(search.toLowerCase()) ||
                p.patient_code.toLowerCase().includes(search.toLowerCase())
            )
        }

        setFiltered(result)

    }, [search, statusFilter, patients])
    // ← runs whenever search, statusFilter, or patients changes


    // ── LOADING STATE ─────────────────────────────────────────
    if (loading) {
        return (
            <Layout title="My Patients">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading patients...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // ── ERROR STATE ───────────────────────────────────────────
    if (error) {
        return (
            <Layout title="My Patients">
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
        <Layout title="My Patients">

            {/* ── PAGE HEADER ──────────────────────────────────── */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-700">My Patients</h2>
                    {/* Show total count */}
                    <p className="text-sm text-gray-400 mt-0.5">
                        {patients.length} patients assigned to you
                    </p>
                </div>
            </div>


            {/* ── SEARCH + FILTER BAR ──────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">

                {/* Search input */}
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or patient code..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                {/* Status filter buttons */}
                {/* Each button sets the statusFilter state */}
                <div className="flex gap-2">
                    {['all', 'stable', 'alert', 'critical'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`
                                px-3 py-1.5 rounded-lg text-sm font-medium transition
                                ${statusFilter === s
                                    // Active filter → filled color
                                    ? 'bg-blue-600 text-white'
                                    // Inactive → outline style
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                            `}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>


            {/* ── PATIENTS TABLE ────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Results count */}
                <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">
                        Showing {filtered.length} of {patients.length} patients
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">

                        {/* Table headers */}
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-5 py-3 text-left">Patient Name</th>
                                <th className="px-5 py-3 text-left">Code</th>
                                <th className="px-5 py-3 text-left">Date of Birth</th>
                                <th className="px-5 py-3 text-left">Blood Type</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">

                            {/* ── Empty state ───────────────────── */}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                                        {search || statusFilter !== 'all'
                                            ? 'No patients match your search'
                                            : 'No patients assigned yet'
                                        }
                                    </td>
                                </tr>
                            )}

                            {/* ── Patient rows ──────────────────── */}
                            {filtered.map(patient => (
                                <tr
                                    key={patient.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {/* Name */}
                                    <td className="px-5 py-3 font-medium text-gray-700">
                                        {patient.full_name}
                                    </td>

                                    {/* Patient code — monospace font */}
                                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                                        {patient.patient_code}
                                    </td>

                                    {/* Date of birth */}
                                    <td className="px-5 py-3 text-gray-500">
                                        {patient.dob
                                            ? new Date(patient.dob).toLocaleDateString()
                                            : '—'
                                        }
                                    </td>

                                    {/* Blood type */}
                                    <td className="px-5 py-3 text-gray-500">
                                        {patient.blood_type || '—'}
                                    </td>

                                    {/* Status badge */}
                                    <td className="px-5 py-3">
                                        <StatusBadge status={patient.status} />
                                    </td>

                                    {/* View button → navigates to patient detail */}
                                    <td className="px-5 py-3">
                                        <button
                                            onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-medium transition"
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </Layout>
    )
}

export default DoctorPatients