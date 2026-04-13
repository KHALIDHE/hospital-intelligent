# ============================================================
# nurse/urls.py
# All routes prefixed with /api/nurse/
# ============================================================

from django.urls import path
from . import views

urlpatterns = [

    # GET  /api/nurse/profile/ → get nurse profile
    # PUT  /api/nurse/profile/ → update nurse profile
    path('profile/', views.NurseProfileView.as_view()),

    # GET /api/nurse/or-beds/ → list all OR beds
    path('or-beds/', views.ORBedsView.as_view()),

    # PUT /api/nurse/or-beds/<id>/ → update a specific OR bed
    path('or-beds/<int:bed_id>/', views.ORBedDetailView.as_view()),

    # GET /api/nurse/doctor-status/ → check which doctors are free or busy
    path('doctor-status/', views.DoctorStatusView.as_view()),

    # POST /api/nurse/notify-doctor/ → send notification to a doctor
    path('notify-doctor/', views.NotifyDoctorView.as_view()),
    path('all/',           views.AllNursesView.as_view()),
    # ── Room status routes ────────────────────────────────────
    path('rooms/',               views.RoomListView.as_view()),   
    path('rooms/<int:room_id>/', views.RoomDetailView.as_view()),
    

]