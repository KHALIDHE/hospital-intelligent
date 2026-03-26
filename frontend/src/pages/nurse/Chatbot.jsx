// ============================================================
// src/pages/nurse/Chatbot.jsx
// ============================================================
// Nurse AI Assistant.
//
// Nurse CAN ask:
//   - About OR bed availability and status
//   - About which doctors are free/busy
//   - About room occupancy
//
// Nurse CANNOT ask:
//   - About patient medical records
//   - About admin data
//   - About other nurses
//   - About appointments details
// ============================================================

import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const SUGGESTIONS = [
    'How many beds are available?',
    'Which doctors are free now?',
    'Show all OR bed status',
    'Any occupied operating rooms?',
    'Which rooms are in maintenance?',
]

const BLOCKED_PATTERNS = [
    { pattern: /patient record/i,      reason: 'Patient medical records are restricted to doctors only.' },
    { pattern: /medical history/i,     reason: 'Medical history is restricted to doctors only.' },
    { pattern: /prescription/i,        reason: 'Prescription data is restricted to doctors only.' },
    { pattern: /diagnosis/i,           reason: 'Diagnosis information is restricted to doctors only.' },
    { pattern: /all patients/i,        reason: 'Full patient list is restricted to administrators.' },
    { pattern: /hospital statistics/i, reason: 'Hospital statistics are restricted to administrators.' },
    { pattern: /staff management/i,    reason: 'Staff management is restricted to administrators.' },
    { pattern: /admin/i,               reason: 'Administrative functions are restricted to administrators.' },
]

function getBlockReason(message) {
    for (const { pattern, reason } of BLOCKED_PATTERNS) {
        if (pattern.test(message)) return reason
    }
    return null
}


function NurseChatbot() {

    const [messages, setMessages] = useState([])
    const [input,    setInput]    = useState('')
    const [loading,  setLoading]  = useState(false)
    const [fetching, setFetching] = useState(true)
    const [blocked,  setBlocked]  = useState('')
    const bottomRef               = useRef(null)

    useEffect(() => {
        const load = async () => {
            try { const res = await api.get('/chatbot/history/'); setMessages(res.data) }
            catch (err) {} finally { setFetching(false) }
        }
        load()
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const sendMessage = async () => {
        if (!input.trim() || loading) return
        const text = input.trim()
        setInput('')
        setBlocked('')

        const blockReason = getBlockReason(text)
        if (blockReason) { setBlocked(blockReason); return }

        setMessages(prev => [...prev, {
            id: Date.now(), sender: 'user',
            message: text, created_at: new Date().toISOString()
        }])
        setLoading(true)

        try {
            const res = await api.post('/chatbot/', { message: text })
            setMessages(prev => [...prev, {
                id: Date.now() + 1, sender: 'bot',
                message: res.data.reply, created_at: new Date().toISOString()
            }])
        } catch {
            setMessages(prev => [...prev, {
                id: Date.now() + 1, sender: 'bot',
                message: 'Connection error. Please try again.',
                created_at: new Date().toISOString()
            }])
        } finally { setLoading(false) }
    }

    const clearHistory = async () => {
        try { await api.delete('/chatbot/clear/'); setMessages([]) } catch (err) {}
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    return (
        <Layout title="AI Assistant">
            <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 mb-3 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">AI</div>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">Hospital AI Assistant</p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs text-gray-400">Gemma3:4b · Nurse Mode</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-100">
                            Nurse Access
                        </span>
                        {messages.length > 0 && (
                            <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                        )}
                    </div>
                </div>

                {/* Access banner */}
                <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2">
                    <span className="text-teal-500 text-sm">🔒</span>
                    <p className="text-xs text-teal-600">
                        <strong>Nurse mode:</strong> Access limited to OR beds and doctor availability only.
                    </p>
                </div>

                {/* Blocked warning */}
                {blocked && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3 flex items-start gap-2">
                        <span className="text-red-500 text-sm mt-0.5">⛔</span>
                        <div>
                            <p className="text-xs font-semibold text-red-700">Access Restricted</p>
                            <p className="text-xs text-red-600 mt-0.5">{blocked}</p>
                        </div>
                        <button onClick={() => setBlocked('')} className="ml-auto text-red-400 hover:text-red-600 text-xs">✕</button>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 px-1 py-2">
                    {fetching && (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {!fetching && messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
                                <span className="text-2xl">👩‍⚕️</span>
                            </div>
                            <h3 className="font-semibold text-gray-700 mb-1">Nurse AI Assistant</h3>
                            <p className="text-sm text-gray-400 max-w-sm mb-5">
                                Ask me about OR bed availability and doctor status.
                                I have real-time access to the hospital floor data.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {SUGGESTIONS.map(s => (
                                    <button key={s} onClick={() => setInput(s)}
                                        className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full border border-teal-100 transition-colors">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && (
                                <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                    <span className="text-white text-xs font-bold">AI</span>
                                </div>
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                msg.sender === 'user'
                                    ? 'bg-teal-600 text-white rounded-br-sm'
                                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
                            }`}>
                                {msg.message.split('\n').map((line, i) => (
                                    <p key={i} className={line.startsWith('-') ? 'ml-2 mt-1' : i > 0 ? 'mt-1' : ''}>{line}</p>
                                ))}
                                <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-teal-200' : 'text-gray-300'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                                <span className="text-white text-xs font-bold">AI</span>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                <div className="flex gap-1 items-center h-4">
                                    {[0, 150, 300].map(d => (
                                        <div key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="bg-white rounded-2xl border border-gray-100 p-3 mt-3 shadow-sm">
                    {messages.length > 0 && messages.length < 4 && (
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {SUGGESTIONS.slice(0, 3).map(s => (
                                <button key={s} onClick={() => setInput(s)}
                                    className="bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full border border-gray-200 transition-colors">
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <textarea value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about OR beds or doctor availability..."
                            rows={1}
                            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 hover:bg-white transition-colors"
                            style={{ minHeight: '42px', maxHeight: '120px' }}
                        />
                        <button onClick={sendMessage} disabled={!input.trim() || loading}
                            className="bg-teal-600 hover:bg-teal-700 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all self-end">
                            {loading
                                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                  </svg>
                            }
                        </button>
                    </div>
                    <p className="text-xs text-gray-300 mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
                </div>

            </div>
        </Layout>
    )
}

export default NurseChatbot