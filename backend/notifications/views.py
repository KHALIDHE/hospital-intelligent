# ============================================================
# notifications/views.py
# All endpoints for notifications:
#
#   GET  /api/notifications/          → get my notifications
#   PUT  /api/notifications/<id>/read/ → mark as read
#   POST /api/notifications/critical/  → trigger critical alert
# ============================================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


# ============================================================
# MY NOTIFICATIONS VIEW
# Route  : GET /api/notifications/
# Access : Any authenticated user
# Returns: All notifications for the logged-in user
#          Unread ones come first (ordered by created_at desc)
# ============================================================
class MyNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Get all notifications where recipient = logged-in user
        # Already ordered by newest first (set in model Meta)
        notifications = Notification.objects.filter(
            recipient=request.user
        )

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


# ============================================================
# MARK AS READ VIEW
# Route  : PUT /api/notifications/<id>/read/
# Access : Any authenticated user
# What it does:
#   - Sets is_read = True for this notification
#   - Only the recipient can mark their own notification as read
# ============================================================
class MarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, notification_id):

        try:
            notification = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Make sure only the recipient can mark it as read
        # A doctor can't mark another doctor's notification as read
        if notification.recipient != request.user:
            return Response(
                {'error': 'You can only mark your own notifications as read'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Mark as read and save to DB
        notification.is_read = True
        notification.save()

        return Response({'message': 'Notification marked as read'})


# ============================================================
# CRITICAL ALERT VIEW
# Route  : POST /api/notifications/critical/
# Access : Doctor or System (when patient status = critical)
# Body   : { patient_id, message }
# What it does:
#   - Creates an urgent notification for the doctor
#   - Triggers Socket.IO to push it to doctor in real-time
# ============================================================
class CriticalAlertView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # Only doctors or admins can trigger critical alerts
        if request.user.role not in ['doctor', 'admin']:
            return Response(
                {'error': 'Access denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        patient_id = request.data.get('patient_id')
        message    = request.data.get('message')

        if not all([patient_id, message]):
            return Response(
                {'error': 'patient_id and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from patients.models import Patient
        from doctors.models import Doctor

        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=404)

        # Get the patient's primary doctor to notify
        doctor = patient.primary_doctor

        if not doctor:
            return Response(
                {'error': 'This patient has no assigned doctor'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Create the notification in DB ─────────────────────
        notification = Notification.objects.create(
            recipient = doctor.user,    # send to the doctor
            sender    = request.user,   # sent by whoever triggered this
            type      = 'critical_alert',
            message   = message,
            priority  = 'urgent',       # always urgent for critical alerts
        )

        # ── Push via Socket.IO ────────────────────────────────
        # This sends the notification to the doctor in real-time
        # without them needing to refresh the page
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            import json

            channel_layer = get_channel_layer()

            # Send to the doctor's personal socket room
            # Room name is "user_<doctor_user_id>"
            async_to_sync(channel_layer.group_send)(
                f"user_{doctor.user.id}",
                {
                    "type":     "send_notification",
                    "message":  message,
                    "priority": "urgent",
                    "notif_id": notification.id,
                }
            )
        except Exception:
            # If Socket.IO fails, notification is still saved in DB
            # Doctor will see it next time they load the page
            pass

        return Response({
            'message':  'Critical alert sent to doctor',
            'doctor':   doctor.full_name,
            'priority': 'urgent',
        }, status=status.HTTP_201_CREATED)