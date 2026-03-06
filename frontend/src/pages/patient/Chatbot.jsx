// ============================================================
// src/pages/patient/Chatbot.jsx
// ============================================================
// This is the AI Chatbot page for PATIENTS.
//
// CURRENT STATUS: Placeholder — waiting for teammate to finish
// the external chatbot API.
//
// WHAT THIS PAGE WILL DO WHEN READY:
//   1. Patient types a question in the chat box
//   2. React sends the message to Django:
//      POST /api/chatbot/ → { message: "when is my next appointment?" }
//   3. Django adds context: { role: 'patient', userId: 'P001' }
//   4. Django forwards to external chatbot API
//   5. Chatbot sees role='patient' → RESTRICTED to own data only
//      Patient CANNOT see other patients' data
//   6. Reply appears in the chat window
//
// WHAT PATIENT CAN ASK (restricted to own data only):
//   - "When is my next appointment?"
//   - "What medications am I taking?"
//   - "What are my allergies?"
//   - "Are my latest test results normal?"
//   - "Who is my primary doctor?"
//
// HOW TO ACTIVATE WHEN READY:
//   1. Replace this placeholder with the real ChatWindow component
//   2. Import ChatWindow from '../../components/ChatWindow'
//   3. Replace the placeholder div with <ChatWindow />
//
// COMPONENT USED: ChatWindow.jsx (already built in components/)
// API ENDPOINT  : POST /api/chatbot/
// ACCESS        : Patient only (enforced by ProtectedRoute in App.jsx)
// ============================================================

import Layout from '../../components/Layout'


function PatientChatbot() {
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

                    {/* Patient restricted to own data — green theme */}
                    <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4 text-left max-w-sm mx-auto">
                        <p className="text-sm font-medium text-green-700 mb-2">
                            What you will be able to ask about yourself:
                        </p>
                        <ul className="text-sm text-green-600 space-y-1">
                            <li>📅 When is my next appointment?</li>
                            <li>💊 What medications am I taking?</li>
                            <li>⚠️ What are my allergies?</li>
                            <li>🧪 Are my latest test results normal?</li>
                            <li>👨‍⚕️ Who is my primary doctor?</li>
                        </ul>
                    </div>

                </div>
            </div>

        </Layout>
    )
}

export default PatientChatbot