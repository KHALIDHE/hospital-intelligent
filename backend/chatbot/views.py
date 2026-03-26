# ============================================================
# chatbot/views.py
# ============================================================
# Handles all chatbot API endpoints.
#
# Endpoints:
#   POST   /api/chatbot/         → send a message, get reply
#   GET    /api/chatbot/history/ → get last 20 messages
#   DELETE /api/chatbot/clear/   → clear chat history
#
# HOW IT WORKS:
#   1. React sends message to POST /api/chatbot/
#   2. Django saves message to DB
#   3. Django tries to call external MCP server (your Ollama)
#   4. If MCP not ready → returns mock response
#   5. Saves bot reply to DB
#   6. Returns reply to React
#
# WHEN MCP IS READY:
#   Just set CHATBOT_API_URL in settings.py or .env
#   Everything else works automatically
# ============================================================

import requests
from rest_framework.views     import APIView
from rest_framework.response  import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatMessage


# ── URL of your MCP server (change when ready) ───────────────
# When MCP is running → set this to http://localhost:8001/chat
# For now → None means use mock responses
CHATBOT_API_URL = "http://localhost:8001/chat"  # ← change to your MCP URL when ready


# ============================================================
# MOCK RESPONSES
# Used while MCP server is not yet ready.
# Returns realistic responses based on role + keywords.
# ============================================================
def get_mock_response(message, role):
    message_lower = message.lower()

    if role == 'doctor':
        if any(w in message_lower for w in ['patient', 'patients']):
            return "You currently have patients assigned to you. Use the Patients page to see their full details and status."
        if any(w in message_lower for w in ['appointment', 'schedule']):
            return "You have appointments scheduled. Check the Appointments page for your full schedule today."
        if any(w in message_lower for w in ['critical', 'urgent']):
            return "Please check your dashboard immediately — any critical patients are highlighted in red."
        return "Hello Doctor! I can help you with patient information, appointments, and critical alerts. What do you need?"

    elif role == 'nurse':
        if any(w in message_lower for w in ['bed', 'beds', 'or']):
            return "Check the OR Beds page for real-time bed availability and occupancy status."
        if any(w in message_lower for w in ['doctor', 'available', 'free']):
            return "Check the Doctors page to see which doctors are currently free or busy."
        return "Hello! I can help you with OR bed status and doctor availability. What do you need?"

    elif role == 'admin':
        if any(w in message_lower for w in ['patient', 'patients']):
            return "The hospital currently has patients in the system. Check the Patients page for full details."
        if any(w in message_lower for w in ['staff', 'doctor', 'nurse']):
            return "Check the Personnel page to manage all doctors and nurses."
        return "Hello Admin! I have full access to hospital data. What would you like to know?"

    elif role == 'patient':
        if any(w in message_lower for w in ['appointment', 'appointments']):
            return "Check your Appointments page to see upcoming and past appointments."
        if any(w in message_lower for w in ['record', 'dossier', 'medical']):
            return "Your medical records are available in the My Records page."
        if any(w in message_lower for w in ['doctor']):
            return "Your primary doctor is assigned to your account. Check your Profile page."
        return "Hello! I can help you with your appointments, medical records, and general questions."

    return "I'm your AI assistant. How can I help you today?"


# ============================================================
# SEND MESSAGE VIEW
# POST /api/chatbot/
# ============================================================
class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Get message from request
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'error': 'Message is required'}, status=400)

        user = request.user
        role = user.role

        # ── Save user message to DB ───────────────────────────
        ChatMessage.objects.create(
            user    = user,
            sender  = 'user',
            message = message,
        )

        # ── Try calling MCP/external chatbot ─────────────────
        reply = None

        if CHATBOT_API_URL:
            try:
                # Send to your MCP server
                # MCP will query PostgreSQL + call Ollama
                response = requests.post(
                    CHATBOT_API_URL,
                    json    = {
                        'message': message,
                        'role':    role,
                        'user_id': user.id,
                    },
                    timeout = 30  # 30s timeout for AI response
                )
                if response.status_code == 200:
                    reply = response.json().get('reply')
            except requests.exceptions.RequestException:
                # MCP server not reachable → fall back to mock
                reply = None

        # ── Fall back to mock if MCP not available ────────────
        if not reply:
            reply = get_mock_response(message, role)

        # ── Save bot reply to DB ──────────────────────────────
        ChatMessage.objects.create(
            user    = user,
            sender  = 'bot',
            message = reply,
        )

        return Response({'reply': reply})


# ============================================================
# CHAT HISTORY VIEW
# GET /api/chatbot/history/
# ============================================================
class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get last 20 messages for this user
        messages = ChatMessage.objects.filter(
            user = request.user
        ).order_by('-created_at')[:20]

        # Return in chronological order (oldest first)
        data = [{
            'id':         m.id,
            'sender':     m.sender,
            'message':    m.message,
            'created_at': m.created_at,
        } for m in reversed(list(messages))]

        return Response(data)


# ============================================================
# CLEAR HISTORY VIEW
# DELETE /api/chatbot/clear/
# ============================================================
class ClearHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        # Delete all messages for this user
        deleted_count, _ = ChatMessage.objects.filter(
            user=request.user
        ).delete()

        return Response({
            'message': f'Cleared {deleted_count} messages'
        })