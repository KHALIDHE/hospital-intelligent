// ============================================================
// src/App.jsx
// ============================================================
// This is the main routing file of the entire app.
// It defines EVERY page and which roles can access it.
//
// Structure:
//   Public routes  → /login (no auth needed)
//   Protected routes → wrapped with ProtectedRoute + allowedRoles
//
// When a user logs in → they are redirected to their dashboard
// based on their role:
//   doctor  → /dashboard/doctor
//   nurse   → /dashboard/nurse
//   admin   → /dashboard/admin
//   patient → /dashboard/patient
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import ProtectedRoute      from './router/ProtectedRoute'

// ── AUTH ──────────────────────────────────────────────────────
import Login               from './pages/auth/Login'
import Register            from './pages/auth/Register'

// ── DOCTOR ───────────────────────────────────────────────────
import DoctorDashboard     from './pages/doctor/Dashboard'
import DoctorPatients      from './pages/doctor/Patients'
import PatientDetail       from './pages/doctor/PatientDetail'
import DoctorAppointments  from './pages/doctor/Appointments'
import DoctorChatbot       from './pages/doctor/Chatbot'
import DoctorProfile       from './pages/doctor/Profile'

// ── NURSE ─────────────────────────────────────────────────────
import NurseDashboard      from './pages/nurse/Dashboard'
import ORBeds              from './pages/nurse/ORBeds'
import DoctorsAvailability from './pages/nurse/Doctors'
import NurseChatbot        from './pages/nurse/Chatbot'
import NurseProfile        from './pages/nurse/Profile'
import RoomStatus          from './pages/nurse/RoomStatus'  


// ── ADMIN ─────────────────────────────────────────────────────
import AdminDashboard      from './pages/admin/Dashboard'
import AdminPersonnel      from './pages/admin/Personnel'
import AdminPatients       from './pages/admin/Patients'
import AdminAlerts         from './pages/admin/Alerts'
import AdminAudit          from './pages/admin/Audit'
import AdminChatbot        from './pages/admin/Chatbot'
import AdminProfile        from './pages/admin/Profile'
import Hospital3D          from './pages/admin/Hospital3D' 

// ── PATIENT ───────────────────────────────────────────────────
import PatientDashboard    from './pages/patient/Dashboard'
import PatientAppointments from './pages/patient/Appointments'
import PatientRecords      from './pages/patient/Records'
import PatientChatbot      from './pages/patient/Chatbot'
import PatientProfile      from './pages/patient/Profile'


function App() {
    return (
        // AuthProvider wraps everything so every page
        // can access user data via useAuth()
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* ── PUBLIC ──────────────────────────── */}
                    {/* No auth needed — anyone can visit     */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Redirect root URL to login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />


                    {/* ── DOCTOR ──────────────────────────── */}
                    {/* Only role='doctor' can access these   */}
                    <Route path="/dashboard/doctor" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }/>
                    <Route path="/doctor/patients" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <DoctorPatients />
                        </ProtectedRoute>
                    }/>
                    <Route path="/doctor/patients/:id" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <PatientDetail />
                        </ProtectedRoute>
                    }/>
                    <Route path="/doctor/appointments" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <DoctorAppointments />
                        </ProtectedRoute>
                    }/>
                    <Route path="/doctor/chatbot" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <DoctorChatbot />
                        </ProtectedRoute>
                    }/>
                    <Route path="/doctor/profile" element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <DoctorProfile />
                        </ProtectedRoute>
                    }/>


                    {/* ── NURSE ───────────────────────────── */}
                    <Route path="/dashboard/nurse" element={
                        <ProtectedRoute allowedRoles={['nurse']}>
                            <NurseDashboard />
                        </ProtectedRoute>
                    }/>
                    <Route path="/nurse/or-beds" element={
                        <ProtectedRoute allowedRoles={['nurse']}>
                            <ORBeds />
                        </ProtectedRoute>
                    }/>
                    <Route path="/nurse/rooms" element={         
                        <ProtectedRoute allowedRoles={['nurse']}>
                            <RoomStatus />
                        </ProtectedRoute>
                    }/>
                    <Route path="/nurse/doctors" element={
                        <ProtectedRoute allowedRoles={['nurse']}>
                            <DoctorsAvailability />
                        </ProtectedRoute>
                    }/>
                    <Route path="/nurse/chatbot" element={
                        <ProtectedRoute allowedRoles={['nurse']}>
                            <NurseChatbot />
                        </ProtectedRoute>
                    }/>
                    <Route path="/nurse/profile" element={
                        <ProtectedRoute allowedRoles={['nurse']}>
                            <NurseProfile />
                        </ProtectedRoute>
                    }/>


                    {/* ── ADMIN ───────────────────────────── */}
                    <Route path="/dashboard/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin/personnel" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminPersonnel />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin/patients" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminPatients />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin/alerts" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminAlerts />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin/audit" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminAudit />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin/chatbot" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminChatbot />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin/profile" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminProfile />
                        </ProtectedRoute>
                    }/>
                    {/* ← ADD THIS */}
                    <Route path="/admin/hospital-3d" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Hospital3D />
                        </ProtectedRoute>
                    }/>


                    {/* ── PATIENT ─────────────────────────── */}
                    <Route path="/dashboard/patient" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <PatientDashboard />
                        </ProtectedRoute>
                    }/>
                    <Route path="/patient/appointments" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <PatientAppointments />
                        </ProtectedRoute>
                    }/>
                    <Route path="/patient/records" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <PatientRecords />
                        </ProtectedRoute>
                    }/>
                    <Route path="/patient/chatbot" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <PatientChatbot />
                        </ProtectedRoute>
                    }/>
                    <Route path="/patient/profile" element={
                        <ProtectedRoute allowedRoles={['patient']}>
                            <PatientProfile />
                        </ProtectedRoute>
                    }/>

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App