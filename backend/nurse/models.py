# ============================================================
# nurse/models.py
# Defines 2 models:
#   1. Nurse       → nurse profile linked to User account
#   2. ORBed       → operating room beds managed by nurses
# ============================================================

from django.db import models
from users.models import User
from patients.models import Patient


class Nurse(models.Model):

    # ── SHIFT CHOICES ────────────────────────────────────────
    SHIFT_CHOICES = [
        ('morning',   'Morning'),    # e.g. 6am - 2pm
        ('afternoon', 'Afternoon'),  # e.g. 2pm - 10pm
        ('night',     'Night'),      # e.g. 10pm - 6am
    ]

    # ── LINK TO USER ACCOUNT ─────────────────────────────────
    # One nurse has one user account
    # related_name='nurse_profile' → user.nurse_profile gives the nurse object
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='nurse_profile'
    )

    # ── NURSE INFORMATION ────────────────────────────────────
    full_name     = models.CharField(max_length=200)
    phone         = models.CharField(max_length=20, blank=True)

    # The ward this nurse is assigned to e.g. "cardiology"
    assigned_ward = models.CharField(max_length=100)

    # Which shift this nurse works
    shift = models.CharField(
        max_length=20,
        choices=SHIFT_CHOICES,
        default='morning'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Nurse {self.full_name} — {self.assigned_ward}"


class ORBed(models.Model):

    # ── STATUS CHOICES ───────────────────────────────────────
    STATUS_CHOICES = [
        ('available',   'Available'),    # free — no patient
        ('occupied',    'Occupied'),     # patient currently in this bed
        ('maintenance', 'Maintenance'),  # being cleaned or repaired
    ]

    # ── BED INFORMATION ──────────────────────────────────────
    room_name  = models.CharField(max_length=100)  # e.g. OR-1, OR-2
    department = models.CharField(max_length=100)  # e.g. Surgery

    # Current status of the bed
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='available'
    )

    # ── CURRENT PATIENT ──────────────────────────────────────
    # null=True because bed can be empty (no patient)
    # SET_NULL means if patient deleted, just clear this field
    patient = models.ForeignKey(
        Patient,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='or_bed'
    )

    # ── ASSIGNED NURSE ───────────────────────────────────────
    # Which nurse is responsible for this bed right now
    assigned_nurse = models.ForeignKey(
        Nurse,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_beds'
    )

    # ── SURGERY TIMES ────────────────────────────────────────
    # When surgery starts and ends — null if no surgery scheduled
    surgery_start = models.DateTimeField(null=True, blank=True)
    surgery_end   = models.DateTimeField(null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.room_name} — {self.status}"
    
class Room(models.Model):

    # ── DEPARTMENT CHOICES ───────────────────────────────────
    DEPARTMENT_CHOICES = [
        ('urgences',        'Urgences'),
        ('cardiologie',     'Cardiologie'),
        ('chirurgie',       'Chirurgie'),
        ('pediatrie',       'Pédiatrie'),
        ('neurologie',      'Neurologie'),
        ('orthopédie',      'Orthopédie'),
        ('gynécologie',     'Gynécologie'),
        ('réanimation',     'Réanimation'),
        ('oncologie',       'Oncologie'),
        ('pneumologie',     'Pneumologie'),
        ('gastroentérologie', 'Gastroentérologie'),
        ('dermatologie',    'Dermatologie'),
    ]

    # ── STATUS CHOICES ───────────────────────────────────────
    STATUS_CHOICES = [
        ('empty',       'Empty'),        # 🟢 libre
        ('stable',      'Stable'),       # 🟡 patient stable
        ('critical',    'Critical'),     # 🔴 patient critique
        ('maintenance', 'Maintenance'),  # 🟠 en maintenance
    ]

    # ── ROOM INFO ────────────────────────────────────────────
    # Must match the mesh name in your GLB file exactly
    room_number = models.CharField(max_length=100, unique=True)

    department  = models.CharField(
        max_length=50,
        choices=DEPARTMENT_CHOICES
    )

    floor = models.PositiveIntegerField(default=1)

    # ── STATUS ───────────────────────────────────────────────
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='empty'
    )

    # ── AUDIT ────────────────────────────────────────────────
    # Which nurse last updated this room
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_rooms'
    )

    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['department', 'room_number']

    def __str__(self):
        return f"{self.room_number} — {self.department} — {self.status}"