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

    def __str__(self):
        return f"{self.email} ({self.role})"