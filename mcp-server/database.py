# ============================================================
# database.py
# ============================================================
# Direct PostgreSQL connection for MCP server.
# We query the database directly (faster than going through Django API).
#
# WHY direct DB instead of Django API?
#   → Faster (no HTTP overhead)
#   → Can write any SQL we need
#   → MCP server runs locally so it's safe
#
# Django table naming convention:
#   appname_modelname → e.g. patients_patient, doctors_doctor
# ============================================================

import psycopg2
import psycopg2.extras  # ← lets us get results as dicts
import os
from dotenv import load_dotenv

load_dotenv()


# ── CREATE DATABASE CONNECTION ────────────────────────────────
# psycopg2.connect → opens connection to PostgreSQL
# We use RealDictCursor so rows come back as dicts not tuples
# e.g. { 'full_name': 'Ahmed', 'status': 'critical' }
# instead of ('Ahmed', 'critical')
def get_connection():
    return psycopg2.connect(
        host     = '127.0.0.1',
        port     = 5432,
        dbname   = 'hopital_db',
        user     = 'postgres',
        password = 'KHALID1111',
    )

# ── HELPER: run a query and return results as list of dicts ───
def query(sql, params=None):
    # Opens a fresh connection, runs query, closes connection
    # Using 'with' ensures connection is always closed even if error
    with get_connection() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params or [])
            return cur.fetchall()


# ============================================================
# DOCTOR QUERIES
# ============================================================

def get_doctor_by_user_id(user_id):
    """
    Get doctor profile by their user ID.
    Used to find doctor_id from the logged-in user.
    """
    rows = query("""
        SELECT d.id, d.full_name, d.specialty, d.departments, d.phone,
               u.email
        FROM doctors_doctor d
        JOIN users_user u ON u.id = d.user_id
        WHERE d.user_id = %s
    """, [user_id])
    return rows[0] if rows else None


def get_doctor_patients(doctor_id):
    """
    Get all patients assigned to a specific doctor.
    Only returns this doctor's patients — not all patients.
    """
    return query("""
        SELECT p.id, p.full_name, p.patient_code,
               p.status, p.blood_type, p.dob
        FROM patients_patient p
        WHERE p.primary_doctor_id = %s
        ORDER BY
            CASE p.status
                WHEN 'critical' THEN 1  -- critical patients first
                WHEN 'alert'    THEN 2
                WHEN 'stable'   THEN 3
            END
    """, [doctor_id])


def get_critical_patients(doctor_id):
    """
    Get only critical patients for a doctor.
    Used for urgent alerts.
    """
    return query("""
        SELECT p.full_name, p.patient_code, p.status, p.blood_type
        FROM patients_patient p
        WHERE p.primary_doctor_id = %s
        AND   p.status = 'critical'
    """, [doctor_id])


def get_all_patients_admin():
    """
    Get ALL patients in the hospital.
    Admin only — returns everything.
    """
    return query("""
        SELECT p.full_name, p.patient_code, p.status, p.blood_type,
               d.full_name AS doctor_name
        FROM patients_patient p
        LEFT JOIN doctors_doctor d ON d.id = p.primary_doctor_id
        ORDER BY p.status
    """)


# ============================================================
# APPOINTMENT QUERIES
# ============================================================

def get_doctor_appointments(doctor_id):
    """
    Get all appointments for a doctor.
    Includes patient name and appointment details.
    """
    return query("""
        SELECT a.id, a.scheduled_at, a.type, a.status,
               a.department, a.notes,
               p.full_name AS patient_name
        FROM appointments_appointment a
        JOIN patients_patient p ON p.id = a.patient_id
        WHERE a.doctor_id = %s
        ORDER BY a.scheduled_at DESC
    """, [doctor_id])


def get_today_appointments(doctor_id):
    """
    Get only today's appointments for a doctor.
    Uses DATE() to compare just the date part.
    """
    return query("""
        SELECT a.scheduled_at, a.type, a.status, a.department,
               p.full_name AS patient_name
        FROM appointments_appointment a
        JOIN patients_patient p ON p.id = a.patient_id
        WHERE a.doctor_id = %s
        AND   DATE(a.scheduled_at) = CURRENT_DATE
        ORDER BY a.scheduled_at
    """, [doctor_id])


def get_patient_appointments(patient_user_id):
    """
    Get appointments for a patient (by user_id).
    Patient can only see their own appointments.
    """
    return query("""
        SELECT a.scheduled_at, a.type, a.status, a.department,
               d.full_name AS doctor_name
        FROM appointments_appointment a
        JOIN patients_patient p  ON p.id  = a.patient_id
        JOIN doctors_doctor   d  ON d.id  = a.doctor_id
        WHERE p.user_id = %s
        ORDER BY a.scheduled_at DESC
    """, [patient_user_id])


# ============================================================
# NURSE QUERIES
# ============================================================

def get_or_beds():
    """
    Get all OR beds with their current status.
    Returns room name, department, status, patient if occupied.
    """
    return query("""
        SELECT b.id, b.room_name, b.department, b.status,
               b.surgery_start, b.surgery_end,
               p.full_name AS patient_name
        FROM nurse_orbed b
        LEFT JOIN patients_patient p ON p.id = b.patient_id
        ORDER BY b.room_name
    """)


def get_doctor_availability():
    """
    Get all doctors with their current free/busy status.
    A doctor is BUSY if they have an appointment right now.
    Checks if current time falls within an appointment.
    """
    return query("""
        SELECT d.id, d.full_name, d.specialty,
               CASE
                   WHEN EXISTS (
                       SELECT 1 FROM appointments_appointment a
                       WHERE a.doctor_id = d.id
                       AND   a.status IN ('scheduled', 'confirmed')
                       AND   a.scheduled_at <= NOW()
                       AND   a.scheduled_at + (a.duration_min * interval '1 minute') >= NOW()
                   )
                   THEN 'busy'
                   ELSE 'free'
               END AS status
        FROM doctors_doctor d
        ORDER BY d.full_name
    """)


# ============================================================
# PATIENT QUERIES
# ============================================================

def get_patient_by_user_id(user_id):
    """
    Get patient profile by their user ID.
    Used to find patient data from the logged-in user.
    """
    rows = query("""
        SELECT p.id, p.full_name, p.patient_code,
               p.status, p.blood_type, p.dob,
               d.full_name AS doctor_name
        FROM patients_patient p
        LEFT JOIN doctors_doctor d ON d.id = p.primary_doctor_id
        WHERE p.user_id = %s
    """, [user_id])
    return rows[0] if rows else None


# ============================================================
# ADMIN QUERIES
# ============================================================

def get_hospital_stats():
    """
    Get overall hospital statistics.
    Admin only — full overview.
    """
    rows = query("""
        SELECT
            COUNT(*)                                          AS total_patients,
            COUNT(*) FILTER (WHERE status = 'critical')      AS critical,
            COUNT(*) FILTER (WHERE status = 'alert')         AS alert,
            COUNT(*) FILTER (WHERE status = 'stable')        AS stable
        FROM patients_patient
    """)
    return rows[0] if rows else {}


def get_all_staff():
    """
    Get count of all staff members by role.
    """
    return query("""
        SELECT role, COUNT(*) AS count
        FROM users_user
        WHERE role IN ('doctor', 'nurse', 'admin')
        GROUP BY role
    """)