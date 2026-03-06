# ============================================================
# appointments/urls.py
# All routes prefixed with /api/appointments/
# ============================================================

from django.urls import path
from . import views

urlpatterns = [

    # POST /api/appointments/       → book new appointment
    path('', views.BookAppointmentView.as_view()),

    # GET /api/appointments/my/     → my appointments (doctor or patient)
    path('my/', views.MyAppointmentsView.as_view()),

    # GET /api/appointments/all/    → all appointments (admin only)
    path('all/', views.AllAppointmentsView.as_view()),

    # PUT    /api/appointments/<id>/ → update / reschedule
    # DELETE /api/appointments/<id>/ → cancel
    path('<int:appointment_id>/', views.AppointmentDetailView.as_view()),
]