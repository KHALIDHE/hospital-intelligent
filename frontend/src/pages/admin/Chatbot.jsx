// ============================================================
// src/pages/admin/Chatbot.jsx
// ============================================================
// This is the AI Chatbot page for ADMINS.
//
// CURRENT STATUS: Placeholder — waiting for teammate to finish
// the external chatbot API.
//
// WHAT THIS PAGE WILL DO WHEN READY:
//   1. Admin types a question in the chat box
//   2. React sends the message to Django:
//      POST /api/chatbot/ → { message: "how many patients today?" }
//   3. Django adds context: { role: 'admin', userId: 'A001' }
//   4. Django forwards to external chatbot API
//   5. Chatbot sees role='admin' → UNRESTRICTED access to all data
//   6. Reply appears in the chat window
//
// WHAT ADMIN CAN ASK (unrestricted — can ask about anything):
//   - "How many patients are admitted today?"
//   - "Which department has the highest occupancy?"
//   - "Show me all critical patients in the hospital"
//   - "How many nurses are on duty tonight?"
//   - "Show the audit log for Dr. Ahmed today"
//
// HOW TO ACTIVATE WHEN READY:
//   1. Replace this placeholder with the real ChatWindow component
//   2. Import ChatWindow from '../../components/ChatWindow'
//   3. Replace the placeholder div with <ChatWindow />
//
// COMPONENT USED: ChatWindow.jsx (already built in components/)
// API ENDPOINT  : POST /api/chatbot/
// ACCESS        : Admin only (enforced by ProtectedRoute in App.jsx)
// ============================================================

import Layout from '../../components/Layout'


function AdminChatbot() {
    return (
        <Layout title="AI Assistant">

            <div className="flex items-center justify-center h-64">
                <div className="text-center">

                    <p className="text-5xl mb-4">🤖</p>

                    <h3 className="text-xl font-semibold text-gray-600">
                        AI Assistant — Coming Soon
                    </h3>

                    <p className="text-gray-400 text-sm mt-2">
                        This feature is being prepared by the team
                    </p>

                    {/* Admin gets unrestricted access — purple theme */}
                    <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4 text-left max-w-sm mx-auto">
                        <p className="text-sm font-medium text-purple-700 mb-2">
                            As Admin you will have unrestricted access:
                        </p>
                        <ul className="text-sm text-purple-600 space-y-1">
                            <li>📊 How many patients are admitted today?</li>
                            <li>🏥 Which department has highest occupancy?</li>
                            <li>🚨 Show all critical patients in hospital</li>
                            <li>👥 How many nurses are on duty tonight?</li>
                            <li>📋 Show audit log for Dr. Ahmed today</li>
                        </ul>
                    </div>

                </div>
            </div>

        </Layout>
    )
}

export default AdminChatbot