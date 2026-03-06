# ============================================================
# doctors/models.py
# This file defines what a Doctor looks like in the database
# Every doctor has a User account (email, password, role)
# PLUS this Doctor profile (specialty, departments, phone)
# ============================================================

from django.db import models
from users.models import User  # Import our custom User model


class Doctor(models.Model):
    # ── LINK TO USER ACCOUNT ────────────────────────────────
    # Every doctor must have a User account to log in
    # OneToOneField means: one User → one Doctor profile (not more)
    # on_delete=CASCADE means: if the User is deleted, delete the Doctor profile too
    # related_name='doctor_profile' means: from a User object you can do user.doctor_profile
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )

    # ── DOCTOR INFORMATION ───────────────────────────────────
    # Basic info about the doctor
    full_name = models.CharField(max_length=200)  # e.g. "Ahmed Hassan"
    specialty = models.CharField(max_length=100)  # e.g. "Cardiology"
    phone     = models.CharField(max_length=20, blank=True)  # blank=True means optional

    # List of departments this doctor works in
    # JSONField stores a Python list in the DB e.g. ["cardiology", "urgency"]
    # default=list means it starts as an empty list []
    departments = models.JSONField(default=list)

    # ── TIMESTAMPS ───────────────────────────────────────────
    # auto_now_add=True means this is set automatically when the record is created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # This is what shows in Django admin and shell
        # e.g. "Dr. Ahmed Hassan — Cardiology"
        return f"Dr. {self.full_name} — {self.specialty}"