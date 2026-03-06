# ============================================================
# notifications/models.py
# Defines what a Notification looks like in the database
# Notifications are sent to doctors, nurses, patients
# They can be triggered by:
#   - System automatically (critical patient status)
#   - Nurse manually (notify a doctor)
#   - Doctor (lab result ready)
# ============================================================

from django.db import models
from users.models import User


class Notification(models.Model):

    # ── TYPE CHOICES ─────────────────────────────────────────
    # What kind of notification is this
    TYPE_CHOICES = [
        ('critical_alert', 'Critical Alert'),  # patient status = critical
        ('nurse_msg',      'Nurse Message'),   # nurse sent a message to doctor
        ('appointment',    'Appointment'),     # new appointment booked
        ('lab_result',     'Lab Result'),      # test result is ready
        ('system',         'System'),          # general system notification
    ]

    # ── PRIORITY CHOICES ─────────────────────────────────────
    PRIORITY_CHOICES = [
        ('low',    'Low'),
        ('medium', 'Medium'),
        ('high',   'High'),
        ('urgent', 'Urgent'),  # shown as red — requires immediate action
    ]

    # ── WHO RECEIVES THIS NOTIFICATION ───────────────────────
    # Every notification goes to one specific user
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'  # user.notifications.all()
    )

    # ── WHO SENT IT ──────────────────────────────────────────
    # null=True because system notifications have no sender
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_notifications'
    )

    # ── NOTIFICATION CONTENT ─────────────────────────────────
    type     = models.CharField(max_length=30, choices=TYPE_CHOICES)
    message  = models.TextField()
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )

    # ── READ STATUS ──────────────────────────────────────────
    # False = not read yet (shows as unread in the UI)
    # True  = user has seen it
    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To: {self.recipient.email} | {self.type} | {self.priority}"

    class Meta:
        # Show newest notifications first by default
        ordering = ['-created_at']