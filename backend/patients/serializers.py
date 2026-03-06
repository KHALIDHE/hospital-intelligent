# ============================================================
# patients/serializers.py
# Serializers convert Patient objects to/from JSON
#
# We have 2 serializers:
#   PatientSerializer      → for doctor/admin (full data)
#   PatientSummarySerializer → for patient themselves (limited data)
# ============================================================

from rest_framework import serializers
from .models import Patient, MedicalDossier


# ── FULL SERIALIZER (doctor and admin) ───────────────────────
# Returns all patient data including sensitive medical info
class PatientSerializer(serializers.ModelSerializer):

    # Get the doctor's name from the related Doctor object
    primary_doctor_name = serializers.CharField(
        source='primary_doctor.full_name',
        read_only=True
    )

    class Meta:
        model  = Patient
        fields = [
            'id',
            'full_name',
            'patient_code',
            'dob',
            'blood_type',
            'phone',
            'insurance_id',
            'status',
            'primary_doctor_name',
            'created_at',
        ]
        read_only_fields = ['id', 'patient_code', 'created_at']


# ── SUMMARY SERIALIZER (patient themselves) ──────────────────
# Returns limited data — no sensitive details
# Patients don't see insurance_id or internal codes
class PatientSummarySerializer(serializers.ModelSerializer):

    primary_doctor_name = serializers.CharField(
        source='primary_doctor.full_name',
        read_only=True
    )

    class Meta:
        model  = Patient
        fields = [
            'id',
            'full_name',
            'patient_code',
            'dob',
            'blood_type',
            'status',
            'primary_doctor_name',
        ]


# ── MEDICAL DOSSIER SERIALIZER ───────────────────────────────
class MedicalDossierSerializer(serializers.ModelSerializer):

    # Show doctor name instead of just doctor id
    uploaded_by = serializers.CharField(
        source='doctor.full_name',
        read_only=True
    )

    class Meta:
        model  = MedicalDossier
        fields = ['id', 'pdf_url', 'version', 'uploaded_by', 'created_at']
        read_only_fields = ['id', 'version', 'created_at']