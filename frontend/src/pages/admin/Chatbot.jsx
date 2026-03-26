// ============================================================
// src/pages/admin/Chatbot.jsx
// ============================================================
// Admin AI Assistant — FULL ACCESS.
//
// Admin CAN ask about EVERYTHING:
//   - All patients hospital-wide
//   - All staff (doctors, nurses)
//   - Hospital statistics
//   - OR beds
//   - Critical alerts
//   - Audit information
//
// Admin has NO blocked questions — full hospital access.
// ============================================================

import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const SUGGESTIONS = [
    'Give me a hospital overview',
    'How many critical patients?',
    'Show all staff count',
    'Which beds are occupied?',
    'Any urgent alerts?',
    'Patient statistics by status',
]


function AdminChatbot() {

    const [messages, setMessages] = useState([])
    const [input,    setInput]    = useState('')
    const [loading,  setLoading]  = useState(false)
    const [fetching, setFetching] = useState(true)
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

        // Admin has NO restrictions — all questions allowed
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
                        <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">AI</div>
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">Hospital AI Assistant</p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs text-gray-400">Gemma3:4b · Admin Mode · Full Access</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-100">
                            Full Access
                        </span>
                        {messages.length > 0 && (
                            <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                        )}
                    </div>
                </div>

                {/* Full access banner */}
                <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 mb-3 flex items-center gap-2">
                    <span className="text-purple-500 text-sm">🛡️</span>
                    <p className="text-xs text-purple-600">
                        <strong>Admin mode:</strong> Full hospital access — patients, staff, statistics, and alerts.
                    </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 px-1 py-2">
                    {fetching && (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {!fetching && messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                                <span className="text-2xl">🛡️</span>
                            </div>
                            <h3 className="font-semibold text-gray-700 mb-1">Admin AI Assistant</h3>
                            <p className="text-sm text-gray-400 max-w-sm mb-5">
                                Full hospital access. Ask about patients, staff, statistics,
                                bed availability, and critical alerts.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {SUGGESTIONS.map(s => (
                                    <button key={s} onClick={() => setInput(s)}
                                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full border border-purple-100 transition-colors">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && (
                                <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                    <span className="text-white text-xs font-bold">AI</span>
                                </div>
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                msg.sender === 'user'
                                    ? 'bg-purple-600 text-white rounded-br-sm'
                                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
                            }`}>
                                {msg.message.split('\n').map((line, i) => (
                                    <p key={i} className={
                                        line.startsWith('-') ? 'ml-2 mt-1' :
                                        line.includes('[CRITICAL]') ? 'text-red-600 font-semibold mt-1' :
                                        i > 0 ? 'mt-1' : ''
                                    }>{line}</p>
                                ))}
                                <p className={`text-xs mt-2 ${msg.sender === 'user' ? 'text-purple-200' : 'text-gray-300'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
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
                            placeholder="Ask anything about the hospital..."
                            rows={1}
                            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 hover:bg-white transition-colors"
                            style={{ minHeight: '42px', maxHeight: '120px' }}
                        />
                        <button onClick={sendMessage} disabled={!input.trim() || loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all self-end">
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

export default AdminChatbot