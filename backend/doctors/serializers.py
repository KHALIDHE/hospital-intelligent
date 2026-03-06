# ============================================================
# doctors/serializers.py
# Serializers convert Doctor objects to/from JSON
# When we GET a doctor → serializer converts DB object to JSON
# When we PUT/POST → serializer validates incoming JSON data
# ============================================================

from rest_framework import serializers
from .models import Doctor  # Import the Doctor model we just created


class DoctorSerializer(serializers.ModelSerializer):

    # ── EXTRA FIELD FROM RELATED USER ───────────────────────
    # The email is stored in the User model, not in Doctor model
    # We use source='user.email' to tell the serializer:
    # "go to the linked User and get its email field"
    # read_only=True means this field can't be changed from this serializer
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        # Which model this serializer is for
        model = Doctor

        # Which fields to include in the JSON response
        fields = [
            'id',           # Doctor's DB id
            'email',        # From the linked User (read only)
            'full_name',    # Doctor's name
            'specialty',    # e.g. Cardiology
            'departments',  # e.g. ["cardiology", "urgency"]
            'phone',        # Phone number
            'created_at',   # When the profile was created
        ]

        # These fields are returned in responses but cannot be changed via API
        # id and created_at are set automatically by Django
        # email is read_only because we set it above
        read_only_fields = ['id', 'email', 'created_at']