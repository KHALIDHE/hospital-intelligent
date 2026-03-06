# ============================================================
# nurse/serializers.py
# Converts Nurse and ORBed objects to/from JSON
# ============================================================

from rest_framework import serializers
from .models import Nurse, ORBed


class NurseSerializer(serializers.ModelSerializer):

    # Get email from the linked User model
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model  = Nurse
        fields = [
            'id',
            'email',
            'full_name',
            'phone',
            'assigned_ward',
            'shift',
            'created_at',
        ]
        read_only_fields = ['id', 'email', 'created_at']


class ORBedSerializer(serializers.ModelSerializer):

    # Show patient name instead of just patient ID
    patient_name = serializers.CharField(
        source='patient.full_name',
        read_only=True
    )

    # Show nurse name instead of just nurse ID
    nurse_name = serializers.CharField(
        source='assigned_nurse.full_name',
        read_only=True
    )

    class Meta:
        model  = ORBed
        fields = [
            'id',
            'room_name',
            'department',
            'status',
            'patient',       # patient ID (for updating)
            'patient_name',  # patient name (for displaying)
            'assigned_nurse',      # nurse ID
            'nurse_name',          # nurse name
            'surgery_start',
            'surgery_end',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at', 'patient_name', 'nurse_name']