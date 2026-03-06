// ============================================================
// src/components/ChatWindow.jsx
// ============================================================
// This is the reusable chat UI used by ALL chatbot pages:
//   /doctor/chatbot
//   /nurse/chatbot
//   /admin/chatbot
//   /patient/chatbot
//
// What it does:
//   1. Shows a scrollable list of messages (user + bot)
//   2. Has an input box at the bottom to type messages
//   3. When user sends a message:
//      a. Adds the message to the chat immediately
//      b. Calls POST /api/chatbot/ with the message
//      c. Shows "typing..." while waiting for reply
//      d. Adds the bot reply to the chat
//
// HOW to use it in any chatbot page:
//   import ChatWindow from '../../components/ChatWindow'
//   <ChatWindow />
// ============================================================

import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'


function ChatWindow() {

    // ── STATE ─────────────────────────────────────────────────

    // messages → array of { id, sender: 'user'|'bot', text, time }
    const [messages, setMessages] = useState([
        // Welcome message shown when chat first opens
        {
            id:     0,
            sender: 'bot',
            text:   'Hello! I am your AI medical assistant. How can I help you today?',
            time:   new Date().toLocaleTimeString(),
        }
    ])

    // input → what the user is currently typing
    const [input,   setInput]   = useState('')

    // loading → true while waiting for bot reply
    //           shows "typing..." bubble
    const [loading, setLoading] = useState(false)

    // ref → used to auto-scroll to the latest message
    const bottomRef = useRef(null)


    // ── AUTO SCROLL ───────────────────────────────────────────
    // Every time messages array changes → scroll to the bottom
    // So the latest message is always visible
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])


    // ── SEND MESSAGE ──────────────────────────────────────────
    // Called when user presses Enter or clicks Send button
    const sendMessage = async () => {

        // Don't send empty messages
        const trimmed = input.trim()
        if (!trimmed || loading) return

        // ── Add user message to chat immediately ──────────────
        // Don't wait for API — show message right away
        const userMessage = {
            id:     Date.now(),         // unique ID using timestamp
            sender: 'user',
            text:   trimmed,
            time:   new Date().toLocaleTimeString(),
        }
        setMessages(prev => [...prev, userMessage])

        // Clear the input box
        setInput('')

        // Show loading / typing state
        setLoading(true)

        try {
            // ── Call chatbot API ──────────────────────────────
            // POST /api/chatbot/ with the message
            // Django adds role + userId and forwards to external chatbot
            const response = await api.post('/chatbot/', {
                message: trimmed
            })

            // ── Add bot reply to chat ─────────────────────────
            const botMessage = {
                id:     Date.now() + 1,
                sender: 'bot',
                text:   response.data.reply,
                time:   new Date().toLocaleTimeString(),
            }
            setMessages(prev => [...prev, botMessage])

        } catch (error) {

            // ── Show error message in chat ────────────────────
            const errorMessage = {
                id:     Date.now() + 1,
                sender: 'bot',
                text:   'Sorry, I could not process your request. Please try again.',
                time:   new Date().toLocaleTimeString(),
            }
            setMessages(prev => [...prev, errorMessage])

        } finally {
            setLoading(false)
        }
    }


    // ── HANDLE ENTER KEY ──────────────────────────────────────
    // Send message when user presses Enter (not Shift+Enter)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()  // prevent new line
            sendMessage()
        }
    }


    // ============================================================
    // RENDER
    // ============================================================
    return (
        // ── Chat container — full height flex column ──────────
        <div className="flex flex-col h-full bg-white rounded-xl shadow border border-gray-200">

            {/* ── Chat header ───────────────────────────────────── */}
            <div className="bg-blue-700 text-white px-5 py-3 rounded-t-xl flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                    <h3 className="font-semibold">AI Medical Assistant</h3>
                    <p className="text-xs opacity-70">Powered by AI — responses based on your role</p>
                </div>
            </div>

            {/* ── Messages area ─────────────────────────────────── */}
            {/* flex-1 → takes all available space between header and input */}
            {/* overflow-y-auto → scroll when messages overflow */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

                {/* Loop through all messages */}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`
                                max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm
                                ${msg.sender === 'user'
                                    // User messages → blue bubble on right
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    // Bot messages → gray bubble on left
                                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                }
                            `}
                        >
                            {/* Message text */}
                            <p>{msg.text}</p>

                            {/* Timestamp */}
                            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                                {msg.time}
                            </p>
                        </div>
                    </div>
                ))}

                {/* ── Typing indicator ──────────────────────────── */}
                {/* Shown while waiting for bot reply */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                            <div className="flex gap-1">
                                {/* Three animated dots */}
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Invisible div at the bottom — used for auto-scroll */}
                <div ref={bottomRef} />
            </div>

            {/* ── Input area ────────────────────────────────────── */}
            <div className="border-t border-gray-200 px-4 py-3 flex gap-2">

                {/* Text input */}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question..."
                    disabled={loading}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                />

                {/* Send button */}
                <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>

        </div>
    )
}

export default ChatWindow