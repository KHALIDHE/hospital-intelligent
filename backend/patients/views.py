# ============================================================
# patients/views.py
# All endpoints related to patients:
#
#   POST /api/patients/register/         → patient registers with code
#   GET  /api/patients/me/               → patient gets own profile
#   GET  /api/patients/<id>/             → doctor/admin gets patient profile
#   PUT  /api/patients/<id>/             → doctor/admin updates patient
#   GET  /api/patients/<id>/dossier/     → get PDF dossier
#   POST /api/patients/<id>/dossier/     → upload new PDF version
#   GET  /api/patients/                  → admin gets all patients
# ============================================================

from django.utils   import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Patient, MedicalDossier
from .serializers import PatientSerializer, PatientSummarySerializer, MedicalDossierSerializer
from doctors.models import Doctor


# ============================================================
# PATIENT REGISTER VIEW
# Route  : POST /api/patients/register/
# Access : Public — no token needed
# Body   : { full_name, dob, email, password, code }
# What it does:
#   - Validates the one-time code
#   - Creates a User account for the patient
#   - Links it to the existing Patient record
# ============================================================
class PatientRegisterView(APIView):

    # AllowAny means no JWT token required — anyone can register
    permission_classes = [AllowAny]

    def post(self, request):

        # Get all fields from the request body
        full_name = request.data.get('full_name')
        email     = request.data.get('email')
        password  = request.data.get('password')
        code      = request.data.get('code')

        # ── Check all fields are present ─────────────────────
        if not all([full_name, email, password, code]):
            return Response(
                {'error': 'full_name, email, password and code are all required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Find the patient record with this code ────────────
        try:
            patient = Patient.objects.get(reg_code=code)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Invalid code — no patient found with this code'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Check code is not already used ───────────────────
        if patient.code_used:
            return Response(
                {'error': 'This code has already been used'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Check code is not expired ─────────────────────────
        if patient.code_expires_at and timezone.now() > patient.code_expires_at:
            return Response(
                {'error': 'This code has expired — ask your doctor for a new one'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Check email not already registered ───────────────
        from users.models import User
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'This email is already registered'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Create the User account ───────────────────────────
        user = User.objects.create_user(
            email     = email,
            password  = password,
            full_name = full_name,
            role      = 'patient'
        )

        # ── Link the User account to the Patient record ───────
        patient.user      = user
        patient.code_used = True   # mark code as used so it can't be reused
        patient.save()

        return Response({
            'message':  'Registration successful — you can now log in',
            'email':    email,
            'role':     'patient',
        }, status=status.HTTP_201_CREATED)


# ============================================================
# PATIENT PROFILE VIEW (for the patient themselves)
# Route  : GET /api/patients/me/
# Access : Patient only
# Returns: Their own profile (simplified — no sensitive data)
# ============================================================
class PatientMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != 'patient':
            return Response(
                {'error': 'Access denied — patients only'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Get the patient record linked to this user
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Use summary serializer — limited data for patient view
        serializer = PatientSummarySerializer(patient)
        return Response(serializer.data)


# ============================================================
# PATIENT DETAIL VIEW (for doctor and admin)
# Route  : GET /api/patients/<id>/  → get full patient profile
# Route  : PUT /api/patients/<id>/  → update patient info
# Access : Doctor (own patients only) or Admin (any patient)
# ============================================================
class PatientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_id):

        # Only doctors and admins can access this
        if request.user.role not in ['doctor', 'admin']:
            return Response(
                {'error': 'Access denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response(
                {'error': 'Patient not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # If doctor → make sure this patient is assigned to them
        # Admin can see any patient so we skip this check for admin
        if request.user.role == 'doctor':
            doctor = Doctor.objects.get(user=request.user)
            if patient.primary_doctor != doctor:
                return Response(
                    {'error': 'This patient is not assigned to you'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Use full serializer — all data for doctor/admin
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    def put(self, request, patient_id):

        if request.user.role not in ['doctor', 'admin']:
            return Response({'error': 'Access denied'}, status=403)

        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=404)

        # Doctor can only update their own patients
        if request.user.role == 'doctor':
            doctor = Doctor.objects.get(user=request.user)
            if patient.primary_doctor != doctor:
                return Response({'error': 'This patient is not assigned to you'}, status=403)

        # partial=True → update only the fields that are sent
        serializer = PatientSerializer(patient, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# ALL PATIENTS VIEW
# Route  : GET /api/patients/
# Access : Admin only
# Returns: All patients in the hospital
# ============================================================
class AllPatientsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != 'admin':
            return Response(
                {'error': 'Access denied — admins only'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all patients — no filter
        patients   = Patient.objects.all()
        serializer = PatientSerializer(patients, many=True)  # many=True for lists
        return Response(serializer.data)


# ============================================================
# MEDICAL DOSSIER VIEW
# Route  : GET  /api/patients/<id>/dossier/ → get latest PDF URL
# Route  : POST /api/patients/<id>/dossier/ → upload new PDF version
# Access : Doctor (own patients) or Admin
# ============================================================
class MedicalDossierView(APIView):
    permission_classes = [IsAuthenticated]

    # ── GET → return the latest dossier PDF URL ───────────────
    def get(self, request, patient_id):

        if request.user.role not in ['doctor', 'admin']:
            return Response({'error': 'Access denied'}, status=403)

        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({'error': 'Patient not found'}, status=404)

        # Doctor can only view their own patient's dossier
        if request.user.role == 'doctor':
            doctor = Doctor.objects.get(user=request.user)
            if patient.primary_doctor != doctor:
                return Response({'error': 'This patient is not assigned to you'}, status=403)

        # Get all dossier versions ordered by newest first
        dossiers   = MedicalDossier.objects.filter(patient=patient).order_by('-version')
        serializer = MedicalDossierSerializer(dossiers, many=True)
        return Response(serializer.data)

    # ── POST → upload a new PDF version ──────────────────────
    def post(self, request, patient_id):

        if request.user.role != 'doctor':
            return Response({'error': 'Only doctors can upload dossiers'}, status=403)

        try:
            patient = Patient.objects.get(id=patient_id)
            doctor  = Doctor.objects.get(user=request.user)
        except (Patient.DoesNotExist, Doctor.DoesNotExist):
            return Response({'error': 'Patient or doctor not found'}, status=404)

        if patient.primary_doctor != doctor:
            return Response({'error': 'This patient is not assigned to you'}, status=403)

        # Get the PDF URL from request
        # (actual file upload to MinIO will be handled separately)
        pdf_url = request.data.get('pdf_url')

        if not pdf_url:
            return Response({'error': 'pdf_url is required'}, status=400)

        # Get current latest version number → increment by 1
        last_version = MedicalDossier.objects.filter(
            patient=patient
        ).order_by('-version').first()

        new_version = (last_version.version + 1) if last_version else 1

        # Create new dossier record in DB
        dossier = MedicalDossier.objects.create(
            patient = patient,
            doctor  = doctor,
            pdf_url = pdf_url,
            version = new_version
        )

        serializer = MedicalDossierSerializer(dossier)
        return Response(serializer.data, status=status.HTTP_201_CREATED)