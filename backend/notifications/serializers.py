# ============================================================
# notifications/serializers.py
# Converts Notification objects to/from JSON
# ============================================================

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    # Show sender name instead of just sender ID
    # SerializerMethodField lets us write custom logic
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model  = Notification
        fields = [
            'id',
            'type',
            'message',
            'priority',
            'is_read',
            'sender_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'sender_name']

    def get_sender_name(self, obj):
        # If notification has a sender → return their email
        # If no sender (system notification) → return "System"
        if obj.sender:
            return obj.sender.email
        return "System"