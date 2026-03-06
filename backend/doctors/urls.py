from django.urls import path
from . import views

urlpatterns = [
    path('me/',             views.DoctorProfileView.as_view()),    # GET + PUT
    path('my-patients/',    views.DoctorPatientsView.as_view()),   # GET
    path('generate-code/',  views.GeneratePatientCodeView.as_view()), # POST
    path('slots/',          views.DoctorSlotsView.as_view()),      # GET
]