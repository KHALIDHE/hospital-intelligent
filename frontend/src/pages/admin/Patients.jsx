// ============================================================
// src/pages/admin/Patients.jsx
// ============================================================
// Admin sees ALL patients in the hospital.
// Can search, filter by status, view patient details.
//
// API calls:
//   GET /api/patients/all/ → all patients (admin only)
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function AdminPatients() {

    const [patients,     setPatients]     = useState([])
    const [filtered,     setFiltered]     = useState([])
    const [search,       setSearch]       = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [loading,      setLoading]      = useState(true)
    const [error,        setError]        = useState('')

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/patients/all/')
                setPatients(response.data)
                setFiltered(response.data)
            } catch (err) {
                setError('Failed to load patients')
            } finally {
                setLoading(false)
            }
        }
        fetchPatients()
    }, [])

    // Filter logic — same pattern as Doctor Patients page
    useEffect(() => {
        let result = patients
        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter)
        }
        if (search.trim()) {
            result = result.filter(p =>
                p.full_name.toLowerCase().includes(search.toLowerCase()) ||
                p.patient_code?.toLowerCase().includes(search.toLowerCase())
            )
        }
        setFiltered(result)
    }, [search, statusFilter, patients])

    const statusColors = {
        stable:   'bg-green-100 text-green-700 border border-green-200',
        alert:    'bg-yellow-100 text-yellow-700 border border-yellow-200',
        critical: 'bg-red-100 text-red-700 border border-red-200',
    }

    if (loading) {
        return (
            <Layout title="All Patients">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="All Patients">

            {/* Search + filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or patient code..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <div className="flex gap-2">
                    {['all', 'stable', 'alert', 'critical'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                statusFilter === s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 rounded-lg p-4 mb-4">{error}</div>}

            {/* Patients table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Showing {filtered.length} of {patients.length} patients</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-5 py-3 text-left">Name</th>
                                <th className="px-5 py-3 text-left">Code</th>
                                <th className="px-5 py-3 text-left">Primary Doctor</th>
                                <th className="px-5 py-3 text-left">Blood Type</th>
                                <th className="px-5 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No patients found</td></tr>
                            )}
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 font-medium text-gray-700">{p.full_name}</td>
                                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{p.patient_code}</td>
                                    <td className="px-5 py-3 text-gray-500">Dr. {p.primary_doctor_name || '—'}</td>
                                    <td className="px-5 py-3 text-gray-500">{p.blood_type || '—'}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status] || statusColors.stable}`}>
                                            {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                                        </span>
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

export default AdminPatients