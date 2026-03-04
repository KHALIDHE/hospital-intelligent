from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = [
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('admin', 'Admin'),
        ('patient', 'Patient'),
    ]
    role = models.CharField(max_length=10, choices=ROLES)
    USERNAME_FIELD = 'email'           # ← login with email
    REQUIRED_FIELDS = ['username']     # ← username still required by Django internally

    email = models.EmailField(unique=True)  # ← make email unique

    def __str__(self):
        return f"{self.email} ({self.role})"