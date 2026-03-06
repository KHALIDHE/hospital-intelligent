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
# JWTAuthentication is SimpleJWT's default class
# It has all the logic to validate tokens, get users, check expiry...
# We EXTEND it (inherit) so we keep all that logic
# but change only ONE thing: where we get the token from


class CookieJWTAuthentication(JWTAuthentication):
    # ── We inherit from JWTAuthentication ────────────────────
    # This means we get ALL of SimpleJWT's features for free:
    #   - Token validation
    #   - Expiry checking
    #   - User lookup from token
    # We only override the authenticate() method to change
    # WHERE the token is read from (cookie instead of header)

    def authenticate(self, request):
        # ── This method is called automatically by Django ─────
        # on EVERY request that hits a protected endpoint
        # Django calls it and asks: "who is making this request?"
        #
        # It must return ONE of these:
        #   (user, token) → if authentication succeeded
        #   None          → if no token found (not authenticated)
        #   raise exception → if token is invalid or expired

        # ── STEP 1: Get the token from the cookie ─────────────
        # request.COOKIES is a dictionary of all cookies sent by the browser
        # We look for the cookie named 'access_token'
        # This is the same name we used in views.py when we did:
        #   response.set_cookie(key='access_token', value=access, ...)
        token = request.COOKIES.get('access_token')

        # ── STEP 2: If no cookie found → return None ──────────
        # None means "I don't know who this is"
        # Django will then treat the request as anonymous
        # If the endpoint requires authentication → Django returns 401
        # If the endpoint is public → request goes through normally
        if not token:
            return None

        # ── STEP 3: Validate the token ────────────────────────
        # This calls SimpleJWT's built-in validation which checks:
        #   - Is the token a valid JWT format?
        #   - Has the token been tampered with? (signature check)
        #   - Is the token expired? (checks exp claim inside token)
        # If any check fails → it raises an exception → Django returns 401
        validated = self.get_validated_token(token)

        # ── STEP 4: Get the user from the validated token ─────
        # The token contains the user's ID inside it (as a claim)
        # get_user() extracts that ID and fetches the user from DB:
        #   SELECT * FROM users WHERE id = token.user_id
        # Returns the full User object with email, role, etc.
        #
        # We return a TUPLE: (user, token)
        # Django unpacks this and sets:
        #   request.user  = user   ← now available in any view
        #   request.auth  = token  ← the validated token object
        return self.get_user(validated), validated


# Browser sends request with cookie: access_token=eyJ...
#             ↓
# CookieJWTAuthentication.authenticate() runs
#             ↓
# Reads cookie → validates token → gets user from DB
#             ↓
# Sets request.user = the logged-in user
#             ↓
# Your view can now use request.user.role, request.user.email etc.