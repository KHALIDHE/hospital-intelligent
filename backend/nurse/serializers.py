# ============================================================
# nurse/serializers.py
# Converts Nurse and ORBed objects to/from JSON
# ============================================================

from rest_framework import serializers
from .models import Nurse, ORBed ,Room


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

# ============================================================
# RoomSerializer
# Converts Room objects to/from JSON for the nurse room-status
# feature. Used by two endpoints:
#   GET  /api/nurse/rooms/?department=X  → list rooms
#   PATCH /api/nurse/rooms/<id>/         → update status
# ============================================================

class RoomSerializer(serializers.ModelSerializer):

    # ── READ-ONLY DISPLAY FIELDS ─────────────────────────────
    # Show the nurse's full name instead of just their user ID
    # source follows the FK: Room.updated_by → User → nurse_profile → full_name
    updated_by_name = serializers.CharField(
        source='updated_by.nurse_profile.full_name',
        read_only=True,
        default=None   # null if no nurse has updated this room yet
    )

    # Human-readable label for the status e.g. "Critical" instead of "critical"
    # get_FOO_display() is a Django built-in for CharField with choices
    status_label = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    # Human-readable label for the department e.g. "Cardiologie"
    department_label = serializers.CharField(
        source='get_department_display',
        read_only=True
    )

    class Meta:
        model  = Room

        fields = [
            # ── identifiers ───────────────────────────────────
            'id',
            'room_number',      # matches GLB mesh name → drives 3D color

            # ── location ──────────────────────────────────────
            'department',       # raw value e.g. 'cardiologie' (for filtering)
            'department_label', # display value e.g. 'Cardiologie' (for UI)
            'floor',

            # ── status ────────────────────────────────────────
            'status',           # raw value e.g. 'critical' (for logic + 3D)
            'status_label',     # display value e.g. 'Critical' (for UI badge)

            # ── audit ─────────────────────────────────────────
            'updated_by',       # user ID (writable — sent when nurse saves)
            'updated_by_name',  # nurse full name (read-only — shown in UI)
            'updated_at',       # auto timestamp (read-only)
        ]

        read_only_fields = [
            'id',
            'updated_at',
            'status_label',
            'department_label',
            'updated_by_name',
        ]

        # ── PARTIAL UPDATE SUPPORT ────────────────────────────
        # Only 'status' and 'updated_by' should be writable via PATCH.
        # room_number, department, floor are set via fixture and never
        # changed by the nurse — they are structural data.
        extra_kwargs = {
            'room_number': {'read_only': True},
            'department':  {'read_only': True},
            'floor':       {'read_only': True},
        }