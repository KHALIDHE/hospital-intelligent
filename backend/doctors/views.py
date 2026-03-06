# ============================================================
# doctors/views.py
# This file contains all the logic for doctor endpoints:
#
#   GET  /api/doctors/me/            → get doctor profile
#   PUT  /api/doctors/me/            → update doctor profile
#   GET  /api/doctors/my-patients/   → get assigned patients
#   POST /api/doctors/generate-code/ → generate patient code
#   GET  /api/doctors/slots/         → get available time slots
# ============================================================

import uuid                              # Used to generate random codes
from datetime import datetime, timedelta # Used for time slots and code expiry

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated  # Blocks requests without JWT

from .models import Doctor
from .serializers import DoctorSerializer


# ============================================================
# DOCTOR PROFILE VIEW
# Route  : GET  /api/doctors/me/   → return doctor profile
# Route  : PUT  /api/doctors/me/   → update doctor profile
# Access : Doctor only (must have role='doctor' in JWT)
# ============================================================
class DoctorProfileView(APIView):

    # IsAuthenticated checks the JWT cookie automatically
    # If no token → returns 401 Unauthorized before reaching our code
    permission_classes = [IsAuthenticated]

    # ── GET → return doctor profile ──────────────────────────
    def get(self, request):

        # Extra check: even if authenticated, must be a doctor
        # A nurse with a valid token should not access this
        if request.user.role != 'doctor':
            return Response(
                {'error': 'Access denied — doctors only'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # request.user is the logged-in user (set by IsAuthenticated)
            # We use it to find the matching Doctor profile
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            # User has role='doctor' but no Doctor profile was created yet
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Convert the Doctor object to JSON using our serializer
        serializer = DoctorSerializer(doctor)

        # Return the JSON response with status 200 OK
        return Response(serializer.data)

    # ── PUT → update doctor profile ──────────────────────────
    def put(self, request):

        if request.user.role != 'doctor':
            return Response(
                {'error': 'Access denied — doctors only'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # partial=True means the doctor can update only some fields
        # e.g. send only { "phone": "0612345678" } without sending all fields
        # Without partial=True, ALL fields would be required
        serializer = DoctorSerializer(doctor, data=request.data, partial=True)

        if serializer.is_valid():
            # Save the changes to the database
            serializer.save()
            # Return the updated profile
            return Response(serializer.data)

        # If validation failed, return the errors with 400 Bad Request
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# DOCTOR PATIENTS VIEW
# Route  : GET /api/doctors/my-patients/
# Access : Doctor only
# Returns: List of all patients assigned to this doctor
# Note   : This imports Patient model — build patients app first
# ============================================================
class DoctorPatientsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != 'doctor':
            return Response(
                {'error': 'Access denied — doctors only'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response(
                {'error': 'Doctor profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Import here to avoid circular import issues
        # (patients app imports doctors app and vice versa)
        from patients.models import Patient

        # Filter patients where primary_doctor = this doctor
        # This returns a QuerySet (like a list) of Patient objects
        patients = Patient.objects.filter(primary_doctor=doctor)

        # Build a clean list of dictionaries to return as JSON
        # We don't use a serializer here to keep it simple
        data = [
            {
                'id':           p.id,
                'full_name':    p.full_name,
                'patient_code': p.patient_code,  # e.g. P001234
                'dob':          p.dob,            # date of birth
                'blood_type':   p.blood_type,     # e.g. O+
                'status':       p.status,         # stable / alert / critical
            }
            for p in patients  # loop through every patient
        ]

        return Response(data)


# ============================================================
# GENERATE PATIENT CODE VIEW
# Route  : POST /api/doctors/generate-code/
# Access : Doctor only
# Body   : { "patient_id": "..." }
# What it does:
#   - Generates a random 6-char code e.g. MH4X2R
#   - Saves it to the patient record with 48h expiry
#   - Doctor gives this code to the patient to register
# ============================================================
class GeneratePatientCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        if request.user.role != 'doctor':
            return Response(
                {'error': 'Access denied — doctors only'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get patient_id from the request body
        patient_id = request.data.get('patient_id')

        if not patient_id:
            return Response(
                {'error': 'patient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from patients.models import Patient

        try:
            doctor = Doctor.objects.get(user=request.user)

            # Make sure this patient exists AND belongs to this doctor
            # If a doctor tries to generate a code for another doctor's patient → 404
            patient = Patient.objects.get(id=patient_id, primary_doctor=doctor)

        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor profile not found'}, status=404)

        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found or not assigned to you'},
                status=status.HTTP_404_NOT_FOUND
            )

        # ── Generate the code ────────────────────────────────
        # uuid4() creates a random unique id like: a3f5c2b1-...
        # .hex removes the dashes: a3f5c2b1...
        # [:6] takes only the first 6 characters: a3f5c2
        # .upper() makes it uppercase: A3F5C2
        code = uuid.uuid4().hex[:6].upper()

        # Code expires exactly 48 hours from now
        expires_at = datetime.now() + timedelta(hours=48)

        # ── Save code to the patient record in DB ────────────
        patient.reg_code        = code
        patient.code_expires_at = expires_at
        patient.code_used       = False  # not used yet
        patient.save()  # commit to database

        return Response({
            'code':       code,
            'expires_at': expires_at,
            'patient':    patient.full_name,
            'message':    'Give this code to the patient to register on the app'
        })


# ============================================================
# DOCTOR SLOTS VIEW
# Route  : GET /api/doctors/slots/?date=2025-03-01
# Access : Doctor only (later also nurse and patient can call this)
# Returns: List of available time slots for the given date
# How it works:
#   - Generates all slots from 8am to 5pm every 30 minutes
#   - Removes slots that already have a booked appointment
#   - Returns only the free slots
# ============================================================
class DoctorSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != 'doctor':
            return Response(
                {'error': 'Access denied — doctors only'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get date from query params e.g. /slots/?date=2025-03-01
        date_str = request.query_params.get('date')

        if not date_str:
            return Response(
                {'error': 'date is required — e.g. ?date=2025-03-01'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Convert the string "2025-03-01" to a real date object
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format — use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )

        doctor = Doctor.objects.get(user=request.user)

        # ── Generate all possible slots ───────────────────────
        # Start at 8:00 AM on the given date
        # Add 30 minutes each time for 18 slots → ends at 5:00 PM
        all_slots = []
        start = datetime.combine(date, datetime.min.time()).replace(hour=8)
        for i in range(18):  # 18 slots × 30 min = 9 hours (8am to 5pm)
            all_slots.append(start + timedelta(minutes=30 * i))

        # ── Get already booked appointments ───────────────────
        # Import here to avoid circular imports
        from appointments.models import Appointment

        # Get all appointments for this doctor on this date
        # that are scheduled or confirmed (not cancelled)
        # values_list('scheduled_at', flat=True) → returns just the times as a list
        booked = Appointment.objects.filter(
            doctor=doctor,
            scheduled_at__date=date,       # __date extracts just the date part
            status__in=['scheduled', 'confirmed']  # ignore cancelled ones
        ).values_list('scheduled_at', flat=True)

        # Remove timezone info from booked times for comparison
        booked_times = [b.replace(tzinfo=None) for b in booked]

        # ── Remove booked slots from all slots ────────────────
        # Only keep slots that are NOT in the booked list
        available = [
            slot.strftime('%H:%M')  # format as "08:00", "08:30", etc.
            for slot in all_slots
            if slot not in booked_times
        ]

        return Response({
            'date':      date_str,
            'doctor':    doctor.full_name,
            'available': available  # e.g. ["08:00", "08:30", "09:30", ...]
        })