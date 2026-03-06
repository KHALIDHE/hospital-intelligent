# ============================================================
# appointments/views.py
# All endpoints for appointments:
#
#   POST /api/appointments/          → book new appointment
#   GET  /api/appointments/my/       → get my appointments
#   PUT  /api/appointments/<id>/     → reschedule / update
#   DELETE /api/appointments/<id>/   → cancel appointment
#   GET  /api/appointments/all/      → admin gets all appointments
# ============================================================

from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Appointment
from .serializers import AppointmentSerializer
from doctors.models import Doctor
from patients.models import Patient


# ============================================================
# BOOK APPOINTMENT VIEW
# Route  : POST /api/appointments/
# Access : Patient, Doctor, Nurse
# Body   : { patient_id, doctor_id, department, scheduled_at, type }
# ============================================================
class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # Only these roles can book appointments
        if request.user.role not in ['patient', 'doctor', 'nurse']:
            return Response(
                {'error': 'Access denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get fields from request body
        patient_id   = request.data.get('patient_id')
        doctor_id    = request.data.get('doctor_id')
        department   = request.data.get('department')
        scheduled_at = request.data.get('scheduled_at')
        type         = request.data.get('type', 'consultation')
        notes        = request.data.get('notes', '')

        # Check all required fields are present
        if not all([patient_id, doctor_id, department, scheduled_at]):
            return Response(
                {'error': 'patient_id, doctor_id, department and scheduled_at are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            patient = Patient.objects.get(id=patient_id)
            doctor  = Doctor.objects.get(id=doctor_id)
        except (Patient.DoesNotExist, Doctor.DoesNotExist):
            return Response(
                {'error': 'Patient or doctor not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # If patient is booking → they can only book for themselves
        if request.user.role == 'patient':
            if not hasattr(request.user, 'patient_profile') or \
               request.user.patient_profile.id != patient.id:
                return Response(
                    {'error': 'You can only book appointments for yourself'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # ── Check the slot is not already taken ───────────────
        # Check if doctor already has an appointment at this time
        conflict = Appointment.objects.filter(
            doctor       = doctor,
            scheduled_at = scheduled_at,
            status__in   = ['scheduled', 'confirmed']
        ).exists()  # returns True if any appointment found

        if conflict:
            return Response(
                {'error': 'This time slot is already booked'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Create the appointment ────────────────────────────
        appointment = Appointment.objects.create(
            patient      = patient,
            doctor       = doctor,
            department   = department,
            scheduled_at = scheduled_at,
            type         = type,
            notes        = notes,
            status       = 'scheduled'
        )

        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ============================================================
# MY APPOINTMENTS VIEW
# Route  : GET /api/appointments/my/
# Access : Doctor or Patient
# Doctor → sees all their upcoming appointments
# Patient → sees all their own appointments
# ============================================================
class MyAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role == 'doctor':
            # Get the doctor profile
            try:
                doctor = Doctor.objects.get(user=request.user)
            except Doctor.DoesNotExist:
                return Response({'error': 'Doctor profile not found'}, status=404)

            # Get all appointments for this doctor
            # ordered by date ascending (soonest first)
            appointments = Appointment.objects.filter(
                doctor=doctor
            ).order_by('scheduled_at')

        elif request.user.role == 'patient':
            # Get the patient profile
            try:
                patient = Patient.objects.get(user=request.user)
            except Patient.DoesNotExist:
                return Response({'error': 'Patient profile not found'}, status=404)

            # Get all appointments for this patient
            appointments = Appointment.objects.filter(
                patient=patient
            ).order_by('scheduled_at')

        else:
            return Response({'error': 'Access denied'}, status=403)

        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


# ============================================================
# APPOINTMENT DETAIL VIEW
# Route  : PUT    /api/appointments/<id>/ → reschedule/update
# Route  : DELETE /api/appointments/<id>/ → cancel
# Access : Doctor, Patient (own), Admin
# ============================================================
class AppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    # ── PUT → update / reschedule ─────────────────────────────
    def put(self, request, appointment_id):

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=404)

        # Patient can only update their own appointments
        if request.user.role == 'patient':
            patient = Patient.objects.get(user=request.user)
            if appointment.patient != patient:
                return Response(
                    {'error': 'You can only update your own appointments'},
                    status=403
                )

        # Doctor can only update their own appointments
        if request.user.role == 'doctor':
            doctor = Doctor.objects.get(user=request.user)
            if appointment.doctor != doctor:
                return Response(
                    {'error': 'You can only update your own appointments'},
                    status=403
                )

        # partial=True → only update fields that are sent
        serializer = AppointmentSerializer(
            appointment,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    # ── DELETE → cancel appointment ───────────────────────────
    def delete(self, request, appointment_id):

        try:
            appointment = Appointment.objects.get(id=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=404)

        # Patient can only cancel their own appointments
        if request.user.role == 'patient':
            patient = Patient.objects.get(user=request.user)
            if appointment.patient != patient:
                return Response(
                    {'error': 'You can only cancel your own appointments'},
                    status=403
                )

        # Doctor can only cancel their own appointments
        if request.user.role == 'doctor':
            doctor = Doctor.objects.get(user=request.user)
            if appointment.doctor != doctor:
                return Response(
                    {'error': 'You can only cancel your own appointments'},
                    status=403
                )

        # We don't delete from DB — we just change status to cancelled
        # This keeps the history of all appointments
        appointment.status = 'cancelled'
        appointment.save()

        return Response({'message': 'Appointment cancelled successfully'})


# ============================================================
# ALL APPOINTMENTS VIEW
# Route  : GET /api/appointments/all/
# Access : Admin only
# Returns: Every appointment in the hospital
# ============================================================
class AllAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != 'admin':
            return Response({'error': 'Access denied — admins only'}, status=403)

        # Get all appointments ordered by date
        appointments = Appointment.objects.all().order_by('scheduled_at')
        serializer   = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)