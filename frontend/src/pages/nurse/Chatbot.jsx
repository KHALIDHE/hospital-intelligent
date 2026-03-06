// ============================================================
// src/pages/nurse/Chatbot.jsx
// ============================================================
// This is the AI Chatbot page for NURSES.
//
// CURRENT STATUS: Placeholder — waiting for teammate to finish
// the external chatbot API.
//
// WHAT THIS PAGE WILL DO WHEN READY:
//   1. Nurse types a question in the chat box
//   2. React sends the message to Django:
//      POST /api/chatbot/ → { message: "which beds are free?" }
//   3. Django adds context: { role: 'nurse', userId: 'N001' }
//   4. Django forwards to external chatbot API
//   5. Chatbot sees role='nurse' → only shows ward/OR bed data
//   6. Reply appears in the chat window
//
// WHAT NURSE CAN ASK:
//   - "Which OR beds are currently free?"
//   - "Which doctors are available right now?"
//   - "Who is in OR-2?"
//   - "When does Dr. Ahmed finish his surgery?"
//
// HOW TO ACTIVATE WHEN READY:
//   1. Replace this placeholder with the real ChatWindow component
//   2. Import ChatWindow from '../../components/ChatWindow'
//   3. Replace the placeholder div with <ChatWindow />
//
// COMPONENT USED: ChatWindow.jsx (already built in components/)
// API ENDPOINT  : POST /api/chatbot/
// ACCESS        : Nurse only (enforced by ProtectedRoute in App.jsx)
// ============================================================

import Layout from '../../components/Layout'


function NurseChatbot() {
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

                    {/* Info about what nurse can ask */}
                    <div className="mt-6 bg-teal-50 border border-teal-100 rounded-xl p-4 text-left max-w-sm mx-auto">
                        <p className="text-sm font-medium text-teal-700 mb-2">
                            What you will be able to ask:
                        </p>
                        <ul className="text-sm text-teal-600 space-y-1">
                            <li>🛏️ Which OR beds are currently free?</li>
                            <li>👨‍⚕️ Which doctors are available right now?</li>
                            <li>🏥 Who is currently in OR-2?</li>
                            <li>⏰ When does Dr. Ahmed finish surgery?</li>
                        </ul>
                    </div>

                </div>
            </div>

        </Layout>
    )
}

export default NurseChatbot