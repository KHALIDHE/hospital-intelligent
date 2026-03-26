# ============================================================
# chatbot/models.py
# ============================================================
# Stores chat history for every user.
# Every message sent and every bot reply is saved here.
# This allows the chatbot to remember conversation history.
# ============================================================

from django.db import models
from users.models import User


class ChatMessage(models.Model):

    # SENDER choices — who sent this message
    SENDER_CHOICES = [
        ('user', 'User'),  # message from the human
        ('bot',  'Bot'),   # reply from the AI
    ]

    # Which user this message belongs to
    user    = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )

    # 'user' or 'bot'
    sender  = models.CharField(max_length=10, choices=SENDER_CHOICES)

    # The actual message text
    message = models.TextField()

    # When it was sent — auto-set on creation
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Always return newest messages last
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.email} [{self.sender}]: {self.message[:50]}"