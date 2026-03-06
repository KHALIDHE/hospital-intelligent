# ============================================================
# patients/urls.py
# All routes are prefixed with /api/patients/
# because of how we included them in config/urls.py
# ============================================================

from django.urls import path
from . import views

urlpatterns = [

    # POST /api/patients/register/ → patient registers with one-time code
    path('register/', views.PatientRegisterView.as_view()),

    # GET /api/patients/me/ → patient sees their own profile
    path('me/', views.PatientMeView.as_view()),

    # GET  /api/patients/all/ → admin sees all patients
    path('all/', views.AllPatientsView.as_view()),

    # GET /api/patients/<id>/          → doctor/admin gets full patient profile
    # PUT /api/patients/<id>/          → doctor/admin updates patient
    path('<int:patient_id>/', views.PatientDetailView.as_view()),

    # GET  /api/patients/<id>/dossier/ → get all PDF versions
    # POST /api/patients/<id>/dossier/ → upload new PDF version
    path('<int:patient_id>/dossier/', views.MedicalDossierView.as_view()),
]