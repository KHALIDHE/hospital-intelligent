// ============================================================
// src/pages/admin/Personnel.jsx
// ============================================================
// Admin manages all staff — Doctors and Nurses.
// Shows tabs: Doctors / Nurses
//
// API calls:
//   GET /api/doctors/all/  → all doctors (admin only)
//   GET /api/nurse/all/    → all nurses  (admin only)
// ============================================================

import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api    from '../../api/axios'


function AdminPersonnel() {

    // activeTab → 'doctors' or 'nurses'
    const [activeTab, setActiveTab] = useState('doctors')
    const [doctors,   setDoctors]   = useState([])
    const [nurses,    setNurses]    = useState([])
    const [loading,   setLoading]   = useState(true)
    const [error,     setError]     = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [doctorsRes, nursesRes] = await Promise.all([
                    api.get('/doctors/all/'),
                    api.get('/nurse/all/'),
                ])
                setDoctors(doctorsRes.data)
                setNurses(nursesRes.data)
            } catch (err) {
                setError('Failed to load personnel data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <Layout title="Personnel">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title="Personnel">

            {/* Page header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-700">Staff Management</h2>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
                {['doctors', 'nurses'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === tab
                                ? 'bg-white text-purple-700 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab === 'doctors' ? `👨‍⚕️ Doctors (${doctors.length})` : `👩‍⚕️ Nurses (${nurses.length})`}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4">{error}</div>
            )}

            {/* Doctors table */}
            {activeTab === 'doctors' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-5 py-3 text-left">Name</th>
                                <th className="px-5 py-3 text-left">Email</th>
                                <th className="px-5 py-3 text-left">Specialty</th>
                                <th className="px-5 py-3 text-left">Phone</th>
                                <th className="px-5 py-3 text-left">Departments</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {doctors.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No doctors found</td></tr>
                            )}
                            {doctors.map(doc => (
                                <tr key={doc.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 font-medium text-gray-700">Dr. {doc.full_name}</td>
                                    <td className="px-5 py-3 text-gray-500">{doc.email}</td>
                                    <td className="px-5 py-3 text-gray-500">{doc.specialty}</td>
                                    <td className="px-5 py-3 text-gray-500">{doc.phone || '—'}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {doc.departments?.map(d => (
                                                <span key={d} className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Nurses table */}
            {activeTab === 'nurses' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-5 py-3 text-left">Name</th>
                                <th className="px-5 py-3 text-left">Email</th>
                                <th className="px-5 py-3 text-left">Ward</th>
                                <th className="px-5 py-3 text-left">Shift</th>
                                <th className="px-5 py-3 text-left">Phone</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {nurses.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No nurses found</td></tr>
                            )}
                            {nurses.map(nurse => (
                                <tr key={nurse.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 font-medium text-gray-700">{nurse.full_name}</td>
                                    <td className="px-5 py-3 text-gray-500">{nurse.email}</td>
                                    <td className="px-5 py-3 text-gray-500">{nurse.assigned_ward || '—'}</td>
                                    <td className="px-5 py-3">
                                        <span className="bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full text-xs">
                                            {nurse.shift}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">{nurse.phone || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </Layout>
    )
}

export default AdminPersonnel