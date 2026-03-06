// ============================================================
// src/pages/doctor/PatientDetail.jsx
// ============================================================
// This page shows the FULL profile of a single patient.
// Accessed when doctor clicks "View Profile" from Patients page.
//
// What it shows:
//   1. Patient info card — name, code, DOB, blood type, status
//   2. Primary doctor info
//   3. Medical dossier — list of PDF versions + upload new
//   4. Quick actions — generate registration code
//
// API calls:
//   GET /api/patients/:id/         → full patient profile
//   GET /api/patients/:id/dossier/ → list of PDF dossiers
//   POST /api/doctors/generate-code/ → generate registration code
//
// URL param:
//   /doctor/patients/:id → id is the patient's database ID
//   We get it using useParams() from react-router-dom
// ============================================================

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api   from '../../api/axios'


// ============================================================
// STATUS BADGE
// ============================================================
function StatusBadge({ status }) {
    const colors = {
        stable:   'bg-green-100 text-green-700 border border-green-200',
        alert:    'bg-yellow-100 text-yellow-700 border border-yellow-200',
        critical: 'bg-red-100 text-red-700 border border-red-200',
    }
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || colors.stable}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    )
}


// ============================================================
// MAIN COMPONENT
// ============================================================
function PatientDetail() {

    // ── GET PATIENT ID FROM URL ───────────────────────────────
    // useParams reads the :id from the URL
    // e.g. /doctor/patients/5 → id = "5"
    const { id }     = useParams()
    const navigate   = useNavigate()

    // ── STATE ─────────────────────────────────────────────────
    const [patient,   setPatient]   = useState(null)
    const [dossiers,  setDossiers]  = useState([])  // PDF versions
    const [loading,   setLoading]   = useState(true)
    const [error,     setError]     = useState('')

    // ── CODE GENERATION STATE ─────────────────────────────────
    // generatedCode → the 6-char code returned from API
    // codeLoading   → true while waiting for API
    const [generatedCode,  setGeneratedCode]  = useState(null)
    const [codeLoading,    setCodeLoading]    = useState(false)
    const [codeError,      setCodeError]      = useState('')

    // ── PDF UPLOAD STATE ──────────────────────────────────────
    const [pdfUrl,       setPdfUrl]       = useState('')
    const [uploadLoading, setUploadLoading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [showUpload,    setShowUpload]    = useState(false)


    // ── FETCH PATIENT DATA ON MOUNT ───────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch patient profile and dossiers in parallel
                const [patientRes, dossierRes] = await Promise.all([
                    api.get(`/patients/${id}/`),
                    api.get(`/patients/${id}/dossier/`),
                ])
                setPatient(patientRes.data)
                setDossiers(dossierRes.data)
            } catch (err) {
                setError('Failed to load patient data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id]) // ← re-fetch if id changes


    // ── GENERATE REGISTRATION CODE ────────────────────────────
    // Called when doctor clicks "Generate Code" button
    // Creates a 6-char one-time code the patient uses to register
    const handleGenerateCode = async () => {
        setCodeLoading(true)
        setCodeError('')
        setGeneratedCode(null)

        try {
            const response = await api.post('/doctors/generate-code/', {
                patient_id: id
            })
            // Save the generated code to show it on screen
            setGeneratedCode(response.data.code)
        } catch (err) {
            setCodeError(err.response?.data?.error || 'Failed to generate code')
        } finally {
            setCodeLoading(false)
        }
    }


    // ── UPLOAD PDF DOSSIER ────────────────────────────────────
    // Called when doctor submits the upload form
    // For now we just save the URL — MinIO integration comes later
    const handleUploadDossier = async (e) => {
        e.preventDefault()
        if (!pdfUrl.trim()) return

        setUploadLoading(true)
        setUploadSuccess(false)

        try {
            await api.post(`/patients/${id}/dossier/`, {
                pdf_url: pdfUrl
            })
            setUploadSuccess(true)
            setPdfUrl('')
            setShowUpload(false)

            // Refresh dossier list after upload
            const dossierRes = await api.get(`/patients/${id}/dossier/`)
            setDossiers(dossierRes.data)

        } catch (err) {
            setCodeError('Failed to upload dossier')
        } finally {
            setUploadLoading(false)
        }
    }


    // ── LOADING STATE ─────────────────────────────────────────
    if (loading) {
        return (
            <Layout title="Patient Profile">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-500">Loading patient data...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // ── ERROR STATE ───────────────────────────────────────────
    if (error) {
        return (
            <Layout title="Patient Profile">
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
        <Layout title="Patient Profile">

            {/* ── BACK BUTTON ──────────────────────────────────── */}
            <button
                onClick={() => navigate('/doctor/patients')}
                className="mb-5 text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
                ← Back to Patients
            </button>


            {/* ── TOP GRID: Patient Info + Actions ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                {/* ── PATIENT INFO CARD ───────────────────────────── */}
                {/* Takes 2 columns on large screens */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                    {/* Header row — name + status */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {patient?.full_name}
                            </h2>
                            {/* Patient code in monospace font */}
                            <p className="text-sm text-gray-400 font-mono mt-0.5">
                                {patient?.patient_code}
                            </p>
                        </div>
                        <StatusBadge status={patient?.status} />
                    </div>

                    {/* Info grid — 2 columns */}
                    <div className="grid grid-cols-2 gap-4">

                        {/* Date of birth */}
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">
                                Date of Birth
                            </p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">
                                {patient?.dob
                                    ? new Date(patient.dob).toLocaleDateString()
                                    : '—'
                                }
                            </p>
                        </div>

                        {/* Blood type */}
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">
                                Blood Type
                            </p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">
                                {patient?.blood_type || '—'}
                            </p>
                        </div>

                        {/* Phone */}
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">
                                Phone
                            </p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">
                                {patient?.phone || '—'}
                            </p>
                        </div>

                        {/* Insurance */}
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">
                                Insurance ID
                            </p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">
                                {patient?.insurance_id || '—'}
                            </p>
                        </div>

                        {/* Primary doctor */}
                        <div className="col-span-2">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">
                                Primary Doctor
                            </p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">
                                Dr. {patient?.primary_doctor_name || '—'}
                            </p>
                        </div>

                    </div>
                </div>


                {/* ── ACTIONS CARD ─────────────────────────────────── */}
                <div className="flex flex-col gap-3">

                    {/* ── Generate Registration Code ─────────────────── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="font-semibold text-gray-700 mb-3">
                            Registration Code
                        </h3>
                        <p className="text-xs text-gray-400 mb-3">
                            Generate a one-time code for this patient to register on the app.
                            Valid for 48 hours.
                        </p>

                        {/* Error message */}
                        {codeError && (
                            <p className="text-red-500 text-xs mb-2">{codeError}</p>
                        )}

                        {/* Generated code display */}
                        {generatedCode && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-center">
                                <p className="text-xs text-green-600 mb-1">Give this code to the patient:</p>
                                {/* Large monospace code display */}
                                <p className="text-2xl font-bold text-green-700 font-mono tracking-widest">
                                    {generatedCode}
                                </p>
                                <p className="text-xs text-green-500 mt-1">Valid for 48 hours</p>
                            </div>
                        )}

                        <button
                            onClick={handleGenerateCode}
                            disabled={codeLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                            {codeLoading ? 'Generating...' : '🔑 Generate Code'}
                        </button>
                    </div>

                </div>
            </div>


            {/* ── MEDICAL DOSSIER SECTION ───────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

                {/* Header row */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700">Medical Dossiers (PDF)</h3>

                    {/* Toggle upload form */}
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm transition"
                    >
                        {showUpload ? 'Cancel' : '+ Upload New Version'}
                    </button>
                </div>

                {/* ── Upload form ─────────────────────────────────── */}
                {/* Only shown when showUpload = true */}
                {showUpload && (
                    <form
                        onSubmit={handleUploadDossier}
                        className="bg-blue-50 rounded-lg p-4 mb-4 flex gap-3"
                    >
                        <input
                            type="text"
                            value={pdfUrl}
                            onChange={(e) => setPdfUrl(e.target.value)}
                            placeholder="Enter PDF URL (MinIO path)"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            type="submit"
                            disabled={uploadLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                            {uploadLoading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                )}

                {/* Success message */}
                {uploadSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-3 mb-4 text-sm">
                        ✅ Dossier uploaded successfully
                    </div>
                )}

                {/* ── Dossier list ─────────────────────────────────── */}
                {dossiers.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">
                        No dossiers uploaded yet
                    </p>
                ) : (
                    <div className="space-y-2">
                        {dossiers.map((dossier) => (
                            <div
                                key={dossier.id}
                                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100"
                            >
                                {/* Version + uploader info */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        📄 Version {dossier.version}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Uploaded by {dossier.uploaded_by} ·{' '}
                                        {new Date(dossier.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* View PDF button */}
                                
                                    <a href={dossier.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                >
                                    View PDF
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </Layout>
    )
}

export default PatientDetail
