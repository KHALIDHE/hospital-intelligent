// ============================================================
// src/pages/admin/Profile.jsx
// ============================================================
// Admin profile page — view and edit basic info.
// Admin doesn't have a separate model like Doctor/Nurse
// so we just show/edit the User data directly.
//
// API calls:
//   GET /api/auth/me/ → current user info
// ============================================================

import { useState } from 'react'
import Layout       from '../../components/Layout'
import { useAuth }  from '../../context/AuthContext'


function AdminProfile() {

    // Get user from context — no extra API call needed
    const { user } = useAuth()

    return (
        <Layout title="My Profile">
            <div className="max-w-2xl mx-auto">

                {/* Header card */}
                <div className="bg-purple-700 rounded-xl p-6 mb-5 flex items-center gap-5">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <span className="text-purple-700 text-2xl font-bold">
                            {user?.email?.[0]?.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user?.email}</h2>
                        <p className="text-purple-200 text-sm mt-0.5">Administrator</p>
                    </div>
                </div>

                {/* Info card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Account Information</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">Administrator</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">User ID</p>
                            <p className="text-sm font-mono text-gray-500 mt-0.5">{user?.id}</p>
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    )
}

export default AdminProfile