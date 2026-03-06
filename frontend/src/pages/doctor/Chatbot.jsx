// ============================================================
// src/pages/doctor/Chatbot.jsx
// ============================================================
// This is the AI Chatbot page for DOCTORS.
//
// CURRENT STATUS: Placeholder — waiting for teammate to finish
// the external chatbot API.
//
// WHAT THIS PAGE WILL DO WHEN READY:
//   1. Doctor types a question in the chat box
//   2. React sends the message to Django:
//      POST /api/chatbot/ → { message: "show my patients" }
//   3. Django adds context: { role: 'doctor', userId: 'D001' }
//   4. Django forwards to external chatbot API
//   5. Chatbot sees role='doctor' → only shows doctor's patients
//   6. Reply appears in the chat window
//
// WHAT DOCTOR CAN ASK:
//   - "Show me my critical patients"
//   - "What appointments do I have today?"
//   - "Show test results for patient P001"
//   - "Who are my patients in cardiology?"
//
// HOW TO ACTIVATE WHEN READY:
//   1. Replace this placeholder with the real ChatWindow component
//   2. Import ChatWindow from '../../components/ChatWindow'
//   3. Replace the placeholder div with <ChatWindow />
//   4. Make sure /api/chatbot/ endpoint is connected to real API
//
// COMPONENT USED: ChatWindow.jsx (already built in components/)
// API ENDPOINT  : POST /api/chatbot/
// ACCESS        : Doctor only (enforced by ProtectedRoute in App.jsx)
// ============================================================

import Layout from '../../components/Layout'  // make sure later is .. 
// Layout wraps every page with Sidebar + Navbar
// title prop → shown in the top Navbar


function DoctorChatbot() {
    return (
        // Layout gives us the Sidebar + Navbar automatically
        // title="AI Assistant" → shown in the top navbar
        <Layout title="AI Assistant">

            {/* ── Placeholder container ──────────────────────── */}
            {/* flex items-center justify-center → centers content */}
            {/* h-64 → gives the container a fixed height */}
            <div className="flex items-center justify-center h-64">

                {/* ── Centered content ─────────────────────────── */}
                <div className="text-center">

                    {/* Robot icon */}
                    <p className="text-5xl mb-4">🤖</p>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-600">
                        AI Assistant — Coming Soon
                    </h3>

                    {/* Subtitle */}
                    <p className="text-gray-400 text-sm mt-2">
                        This feature is being prepared by the team
                    </p>

                    {/* Info about what it will do */}
                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-left max-w-sm mx-auto">
                        <p className="text-sm font-medium text-blue-700 mb-2">
                            What you will be able to ask:
                        </p>
                        {/* List of example questions */}
                        <ul className="text-sm text-blue-600 space-y-1">
                            <li>📋 Show my critical patients</li>
                            <li>📅 What appointments do I have today?</li>
                            <li>🧪 Show test results for patient P001</li>
                            <li>💊 List medications for Ahmed Hassan</li>
                        </ul>
                    </div>

                </div>
            </div>

        </Layout>
    )
}

export default DoctorChatbot