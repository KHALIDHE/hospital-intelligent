# ============================================================
# nurse/views.py
# All endpoints for nurses:
#
#   GET  /api/nurse/profile/          → get nurse profile
#   PUT  /api/nurse/profile/          → update nurse profile
#   GET  /api/nurse/or-beds/          → list all OR beds
#   PUT  /api/nurse/or-beds/<id>/     → update OR bed
#   GET  /api/nurse/doctor-status/    → check doctors free or busy
#   POST /api/nurse/notify-doctor/    → send notification to doctor
# ============================================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Nurse, ORBed
from .serializers import NurseSerializer, ORBedSerializer
from doctors.models import Doctor


# ============================================================
# NURSE PROFILE VIEW
# Route  : GET /api/nurse/profile/ → get nurse profile
# Route  : PUT /api/nurse/profile/ → update nurse profile
# Access : Nurse only
# ============================================================
class NurseProfileView(APIView):
    permission_classes = [IsAuthenticated]

    # ── GET → return nurse profile ────────────────────────────
    def get(self, request):

        if request.user.role != 'nurse':
            return Response(
                {'error': 'Access denied — nurses only'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Get the Nurse profile linked to this logged-in user
            nurse = Nurse.objects.get(user=request.user)
        except Nurse.DoesNotExist:
            return Response(
                {'error': 'Nurse profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = NurseSerializer(nurse)
        return Response(serializer.data)

    # ── PUT → update nurse profile ────────────────────────────
    def put(self, request):

        if request.user.role != 'nurse':
            return Response(
                {'error': 'Access denied — nurses only'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            nurse = Nurse.objects.get(user=request.user)
        except Nurse.DoesNotExist:
            return Response({'error': 'Nurse profile not found'}, status=404)

        # partial=True → only update fields that are sent
        serializer = NurseSerializer(nurse, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# OR BEDS VIEW
# Route  : GET /api/nurse/or-beds/ → list all OR beds
# Access : Nurse and Admin
# ============================================================
class ORBedsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Both nurse and admin can see OR beds
        if request.user.role not in ['nurse', 'admin']:
            return Response(
                {'error': 'Access denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all beds ordered by room name
        beds       = ORBed.objects.all().order_by('room_name')
        serializer = ORBedSerializer(beds, many=True)
        return Response(serializer.data)


# ============================================================
# OR BED DETAIL VIEW
# Route  : PUT /api/nurse/or-beds/<id>/
# Access : Nurse only
# Body   : { status, patient, assigned_nurse, surgery_start, surgery_end }
# What it does:
#   - Nurse can change bed status (available/occupied/maintenance)
#   - Assign a patient to the bed
#   - Set surgery start and end times
# ============================================================
class ORBedDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, bed_id):

        if request.user.role != 'nurse':
            return Response(
                {'error': 'Access denied — nurses only'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            bed = ORBed.objects.get(id=bed_id)
        except ORBed.DoesNotExist:
            return Response(
                {'error': 'OR Bed not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # partial=True → only update the fields that are sent
        # e.g. nurse can just send { "status": "available" }
        # without sending all other fields
        serializer = ORBedSerializer(bed, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# DOCTOR STATUS VIEW
# Route  : GET /api/nurse/doctor-status/
# Access : Nurse only
# Returns: List of all doctors with their current status
#          Free → no appointment right now
#          Busy → has an appointment at this moment
# ============================================================
class DoctorStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != 'nurse':
            return Response(
                {'error': 'Access denied — nurses only'},
                status=status.HTTP_403_FORBIDDEN
            )

        from django.utils import timezone
        from appointments.models import Appointment

        # Get current time
        now = timezone.now()

        # Get all doctors
        doctors = Doctor.objects.all()

        result = []
        for doctor in doctors:

            # Check if doctor has an active appointment RIGHT NOW
            # An appointment is active if:
            #   - scheduled_at is in the past (already started)
            #   - and it's within the duration window (not finished yet)
            #   - and status is confirmed or scheduled
            active_appointment = Appointment.objects.filter(
                doctor     = doctor,
                status__in = ['scheduled', 'confirmed'],
                scheduled_at__lte = now,  # started before or at now
            ).first()

            result.append({
                'id':         doctor.id,
                'full_name':  doctor.full_name,
                'specialty':  doctor.specialty,
                'status':     'busy' if active_appointment else 'free',
                # If busy, show what they're doing
                'current_appointment': (
                    {
                        'patient':  active_appointment.patient.full_name,
                        'type':     active_appointment.type,
                        'since':    active_appointment.scheduled_at,
                    }
                    if active_appointment else None
                )
            })

        return Response(result)


# ============================================================
# NOTIFY DOCTOR VIEW
# Route  : POST /api/nurse/notify-doctor/
# Access : Nurse only
# Body   : { doctor_id, message, priority, patient_id (optional) }
# What it does:
#   - Creates a notification in the DB for the doctor
#   - Socket.IO will push it to the doctor in real-time
#     (Socket.IO part will be added in notifications app)
# ============================================================
class NotifyDoctorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role != 'nurse':
            return Response(
                {'error': 'Access denied — nurses only'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get fields from request body
        doctor_id  = request.data.get('doctor_id')
        message    = request.data.get('message')
        priority   = request.data.get('priority', 'medium')  # default medium
        patient_id = request.data.get('patient_id')          # optional

        # Check required fields
        if not all([doctor_id, message]):
            return Response(
                {'error': 'doctor_id and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=404)

        try:
            nurse = Nurse.objects.get(user=request.user)
        except Nurse.DoesNotExist:
            return Response({'error': 'Nurse profile not found'}, status=404)

        # ── Save notification to DB ───────────────────────────
        # Import here to avoid circular imports
        from notifications.models import Notification

        notification = Notification.objects.create(
            recipient   = doctor.user,  # doctor's User account
            sender      = request.user, # nurse's User account
            type        = 'nurse_msg',
            message     = message,
            priority    = priority,
        )

        return Response({
            'message':  'Notification sent to doctor successfully',
            'doctor':   doctor.full_name,
            'priority': priority,
        }, status=status.HTTP_201_CREATED)
    
# ── Admin: list ALL nurses ────────────────────────────────────
class AllNursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only admin can access
        if request.user.role != 'admin':
            return Response({'error': 'Forbidden'}, status=403)

        nurses = Nurse.objects.select_related('user').all()
        data = [{
            'id':            n.id,
            'full_name':     n.full_name,
            'email':         n.user.email,
            'phone':         n.phone,
            'assigned_ward': n.assigned_ward,
            'shift':         n.shift,
        } for n in nurses]
        return Response(data)