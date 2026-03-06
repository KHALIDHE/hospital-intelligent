# ============================================================
# appointments/models.py
# Defines what an Appointment looks like in the database
# An appointment links a Patient to a Doctor at a specific time
# ============================================================

from django.db import models
from patients.models import Patient
from doctors.models import Doctor


class Appointment(models.Model):

    # ── TYPE CHOICES ─────────────────────────────────────────
    # What kind of appointment is this
    TYPE_CHOICES = [
        ('consultation', 'Consultation'),  # first visit
        ('followup',     'Follow-up'),     # regular check
        ('lab',          'Lab Test'),      # blood test etc
        ('surgery',      'Surgery'),       # operation
    ]

    # ── STATUS CHOICES ───────────────────────────────────────
    # Current state of the appointment
    STATUS_CHOICES = [
        ('scheduled',  'Scheduled'),   # booked but not confirmed
        ('confirmed',  'Confirmed'),   # doctor confirmed
        ('cancelled',  'Cancelled'),   # cancelled by patient or doctor
        ('completed',  'Completed'),   # appointment done
    ]

    # ── RELATIONSHIPS ────────────────────────────────────────
    # Which patient this appointment is for
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,      # if patient deleted → delete appointments
        related_name='appointments'    # patient.appointments.all()
    )

    # Which doctor this appointment is with
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,      # if doctor deleted → delete appointments
        related_name='appointments'    # doctor.appointments.all()
    )

    # ── APPOINTMENT DETAILS ──────────────────────────────────
    department   = models.CharField(max_length=100)       # e.g. Cardiology
    scheduled_at = models.DateTimeField()                 # date + time
    duration_min = models.IntegerField(default=30)        # duration in minutes
    type         = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='consultation'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )

    # Optional notes from doctor or patient
    notes = models.TextField(blank=True, null=True)

    # ── TIMESTAMPS ───────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient.full_name} with Dr.{self.doctor.full_name} on {self.scheduled_at}"