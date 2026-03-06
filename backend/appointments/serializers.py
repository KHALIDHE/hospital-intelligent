# ============================================================
# appointments/serializers.py
# Converts Appointment objects to/from JSON
# ============================================================

from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    # Show names instead of just IDs
    # source tells serializer where to get the value from
    patient_name = serializers.CharField(
        source='patient.full_name',
        read_only=True
    )
    doctor_name = serializers.CharField(
        source='doctor.full_name',
        read_only=True
    )

    class Meta:
        model  = Appointment
        fields = [
            'id',
            'patient',        # patient ID (for creating)
            'patient_name',   # patient name (for displaying)
            'doctor',         # doctor ID (for creating)
            'doctor_name',    # doctor name (for displaying)
            'department',
            'scheduled_at',
            'duration_min',
            'type',
            'status',
            'notes',
            'created_at',
        ]
        # These are set automatically — cannot be changed via API
        read_only_fields = ['id', 'created_at', 'patient_name', 'doctor_name']