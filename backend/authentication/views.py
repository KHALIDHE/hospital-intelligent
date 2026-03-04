# ============================================================
# views.py — Authentication logic for all roles
# Handles: Login, Me (current user), Logout
# ============================================================

from rest_framework.views import APIView          # Base class for creating API endpoints
from rest_framework.response import Response      # Used to return JSON responses
from rest_framework import status                 # HTTP status codes (200, 400, 401, 403...)
from rest_framework.permissions import IsAuthenticated  # Blocks unauthenticated requests
from rest_framework_simplejwt.tokens import RefreshToken  # Generates JWT access + refresh tokens
from django.contrib.auth import authenticate      # Django built-in: checks email + password in DB
from .serializers import LoginSerializer          # Our custom serializer (validates login input)
from users.models import User                     # Our custom User model


# ============================================================
# DOMAIN MAP — each role has a required email domain
# When a user selects a role, their email must match this domain
# patient = None means any personal email is accepted
# ============================================================
DOMAIN_MAP = {
    'doctor':  '@medecin.hopital.ma',
    'nurse':   '@infirmier.hopital.ma',
    'admin':   '@admin.hopital.ma',
    'patient': None,
}


# ============================================================
# LOGIN VIEW
# Route  : POST /api/auth/login
# Access : Public (no token needed)
# What it does:
#   1. Validates incoming data (email, password, role)
#   2. Checks email domain matches the selected role
#   3. Checks email + password exist in DB
#   4. Checks role in DB matches selected role
#   5. Generates JWT token
#   6. Stores token in httpOnly cookie and returns user info
# ============================================================
class LoginView(APIView):

    def post(self, request):
        # ── STEP 1: Validate incoming request data ──────────────
        # request.data contains what React sent: { email, password, role }
        # LoginSerializer checks that all fields exist and are not empty
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            # If something is missing or wrong format → return 400 with error details
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Extract the validated fields
        email    = serializer.validated_data['email']
        password = serializer.validated_data['password']
        role     = serializer.validated_data['role']

        # ── STEP 2: Check email domain matches the selected role ─
        # Example: role = 'doctor' → email must end with @medecin.hopital.ma
        # If role = 'patient' → expected_domain is None → skip this check
        expected_domain = DOMAIN_MAP[role]

        if expected_domain and not email.endswith(expected_domain):
            # Email domain is wrong for this role → reject immediately
            return Response(
                {'error': f'Email must end with {expected_domain} for role {role}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── STEP 3: Check user exists and password is correct ───
        # authenticate() goes to PostgreSQL:
        #   - finds user by email
        #   - compares password with the bcrypt hash stored in DB
        #   - returns the user object if match, None if not
        user = authenticate(request, username=email, password=password)

        if not user:
            # Email not found OR password is wrong → return 401 Unauthorized
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # ── STEP 4: Check role matches what is stored in DB ─────
        # Extra security layer:
        # Even if email + password are correct, the role they selected
        # must match the role stored in the database
        # Prevents a nurse from logging in by selecting 'doctor'
        if user.role != role:
            return Response(
                {'error': 'Role mismatch'},
                status=status.HTTP_403_FORBIDDEN
            )

        # ── STEP 5: Generate JWT tokens ─────────────────────────
        # RefreshToken.for_user() creates 2 tokens:
        #   - access token  → short lived (15 min), sent with every request
        #   - refresh token → long lived (7 days), used to get a new access token
        refresh = RefreshToken.for_user(user)
        access  = str(refresh.access_token)  # convert token object to string

        # ── STEP 6: Build the response and set httpOnly cookie ──
        # We return basic user info in the JSON body
        # React will use 'role' to decide which dashboard to show
        response = Response({
            'message': 'Login successful',
            'role': user.role,
            'user': {
                'id':    user.id,
                'email': user.email,
                'role':  user.role,
            }
        })

        # Store the JWT access token in an httpOnly cookie
        # httponly=True  → JavaScript CANNOT read this cookie (protects against XSS attacks)
        # secure=False   → set to True in production so cookie only sent over HTTPS
        # samesite='Lax' → cookie sent on normal navigation but not on cross-site requests
        response.set_cookie(
            key='access_token',
            value=access,
            httponly=True,
            secure=False,   # ← change to True in production
            samesite='Lax',
        )

        return response


# ============================================================
# ME VIEW
# Route  : GET /api/auth/me
# Access : Protected (JWT token required)
# What it does:
#   - Reads the JWT token from the cookie
#   - Extracts the user_id from the token
#   - Fetches the user from DB
#   - Returns their info to React
# React uses this on page load to know who is logged in
# ============================================================
class MeView(APIView):

    # IsAuthenticated automatically:
    #   1. Reads the JWT token from the cookie
    #   2. Validates it (not expired, not tampered)
    #   3. Attaches the user object to request.user
    #   4. If token missing or invalid → returns 401 automatically
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # request.user is already set by IsAuthenticated
        # No need to query the DB manually
        user = request.user

        return Response({
            'id':    user.id,
            'email': user.email,
            'role':  user.role,
        })


# ============================================================
# LOGOUT VIEW
# Route  : POST /api/auth/logout
# Access : Public (no token check needed)
# What it does:
#   - Deletes the access_token cookie from the browser
#   - User is now logged out — no token = no access
# ============================================================
class LogoutView(APIView):

    def post(self, request):
        response = Response({'message': 'Logged out'})

        # Delete the cookie from the browser
        # After this, every request will fail authentication
        # because there is no token to read anymore
        response.delete_cookie('access_token')

        return response