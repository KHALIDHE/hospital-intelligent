# ============================================================
# chatbot/urls.py
# ============================================================

from django.urls import path
from .views import ChatbotView, ChatHistoryView, ClearHistoryView

urlpatterns = [
    # POST   /api/chatbot/         → send message, get reply
    path('',         ChatbotView.as_view()),

    # GET    /api/chatbot/history/ → get last 20 messages
    path('history/', ChatHistoryView.as_view()),

    # DELETE /api/chatbot/clear/   → clear chat history
    path('clear/',   ClearHistoryView.as_view()),
]