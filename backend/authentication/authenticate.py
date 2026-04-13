# ============================================================
# authentication/authenticate.py
# ============================================================
# WHY does this file exist?
#
# Django REST Framework + SimpleJWT by default reads the token
# from the REQUEST HEADER like this:
#   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
#
# But in our project we store the JWT token in an httpOnly COOKIE
# for security reasons (JavaScript can't steal it).
#
# So we need to tell Django:
#   "Don't look in the header — look in the cookie instead"
#
# This file creates a CUSTOM authentication class that does exactly that.
# We then tell Django to use it in settings.py:
#   'DEFAULT_AUTHENTICATION_CLASSES': (
#       'authentication.authenticate.CookieJWTAuthentication',
#   )
#
# Now every protected endpoint automatically reads the token
# from the cookie without us doing anything extra.
# ============================================================

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
# InvalidToken → raised when token format is wrong or signature is invalid
# TokenError   → raised when token is expired or malformed
# We import these so we can CATCH them gracefully instead of crashing


class CookieJWTAuthentication(JWTAuthentication):
    # ── We inherit from JWTAuthentication ────────────────────
    # This means we get ALL of SimpleJWT's features for free:
    #   - Token validation
    #   - Expiry checking
    #   - User lookup from token
    # We only override the authenticate() method to change
    # WHERE the token is read from (cookie OR header)
    # AND to handle errors gracefully with try/except

    def authenticate(self, request):
        # ── This method is called automatically by Django ─────
        # on EVERY request that hits ANY endpoint (public or protected)
        # Django calls it and asks: "who is making this request?"
        #
        # It must return ONE of these:
        #   (user, token) → authentication succeeded, user is identified
        #   None          → no token found, treat request as anonymous
        #                   (public endpoints will still work!)
        #   raise exception → only if we WANT to block the request
        #                     (we avoid this now — see try/except below)

        try:
            # ── STEP 1: Try to get the token from the cookie ──
            # request.COOKIES is a dict of all cookies sent by the browser
            # We look for the cookie named 'access_token'
            # This is the same name we used in views.py:
            #   response.set_cookie(key='access_token', value=access, ...)
            token = request.COOKIES.get('access_token')

            # ── STEP 2: Fall back to Authorization header ─────
            # On localhost, browsers block cross-origin cookies
            # unless we use HTTPS (which we don't in development).
            # So axios.js also saves the token to localStorage
            # and sends it via Authorization header as a fallback.
            # Format: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
            if not token:
                auth_header = request.headers.get('Authorization', '')
                if auth_header.startswith('Bearer '):
                    # Extract just the token part after "Bearer "
                    token = auth_header.split(' ')[1]

            # ── STEP 3: No token found anywhere → anonymous ───
            # None tells Django: "I don't know who this is"
            # Django will then:
            #   - Allow access if endpoint has AllowAny permission
            #   - Block access (401) if endpoint has IsAuthenticated
            # This is correct behavior — we don't crash, we just
            # let the permission class decide what to do
            if not token:
                return None

            # ── STEP 4: Validate the token ────────────────────
            # This calls SimpleJWT's built-in validation:
            #   - Is the token a valid JWT format?
            #   - Has it been tampered with? (signature check)
            #   - Is it expired? (checks the 'exp' claim)
            # If ANY check fails → raises InvalidToken or TokenError
            # We catch those below instead of letting them crash
            validated = self.get_validated_token(token)

            # ── STEP 5: Get the user from the validated token ──
            # The token contains the user's ID inside it (as a claim)
            # get_user() extracts that ID and fetches user from DB:
            #   SELECT * FROM users WHERE id = token.user_id
            # Returns the full User object with email, role, etc.
            #
            # We return a TUPLE: (user, token)
            # Django unpacks this and sets:
            #   request.user = user   ← available in any view
            #   request.auth = token  ← the validated token object
            return self.get_user(validated), validated

        except (InvalidToken, TokenError):
            # ── Token is invalid or expired ───────────────────
            # IMPORTANT: We return None instead of raising an exception!
            # This means: "I couldn't identify the user, treat as anonymous"
            # Public endpoints (AllowAny) will still work normally.
            # Protected endpoints (IsAuthenticated) will return 401.
            # This is the CORRECT behavior.
            return None

        except Exception:
            # ── Any other unexpected error ─────────────────────
            # Safety net — if anything else goes wrong,
            # we still return None instead of crashing the server.
            # Better to treat as anonymous than to break the app.
            return None


# ── HOW IT ALL FLOWS ──────────────────────────────────────────
#
# Browser sends request with cookie: access_token=eyJ...
#   OR with header: Authorization: Bearer eyJ...
#             ↓
# CookieJWTAuthentication.authenticate() runs
#             ↓
# Tries cookie → tries header → no token? return None
#             ↓
# Has token → validates it → expired? return None (not crash!)
#             ↓
# Valid token → get user from DB → return (user, token)
#             ↓
# Django sets request.user = the logged-in user
#             ↓
# Your view can use request.user.role, request.user.email etc.


# ============================================================
# ── BUG WE FIXED — READ THIS FOR FUTURE DEBUGGING ───────────
# ============================================================
#
# PROBLEM:
#   Even the LOGIN endpoint was returning 401 Unauthorized,
#   which should be impossible since login is a public endpoint.
#
# ROOT CAUSE:
#   The old token saved in the browser's localStorage had EXPIRED.
#   When axios sent any request, it attached this expired token
#   via the Authorization header.
#
#   The old authenticate() had NO try/except, so when
#   get_validated_token() tried to validate the expired token,
#   it raised a TokenError exception.
#
#   Django caught this exception and returned 401 — BEFORE even
#   checking if the endpoint was public or not. This blocked
#   EVERY endpoint including login.
#
# FIX:
#   1. Wrapped everything in try/except(InvalidToken, TokenError)
#      so expired/invalid tokens return None instead of crashing.
#   2. Cleared the browser localStorage to remove the stale token.
#      (F12 → Application → Local Storage → Clear)
#
# HOW TO RECOGNIZE THIS BUG IN THE FUTURE:
#   - Login endpoint returns 401 (should never happen)
#   - Django terminal shows "Unauthorized: /api/auth/login/"
#   - Clearing localStorage fixes it immediately
#   - The bug appears after tokens expire (default: 1 hour)
#
# PREVENTION:
#   Always wrap token validation in try/except in custom
#   authentication classes. Never let token errors bubble up
#   and block public endpoints.
# ============================================================