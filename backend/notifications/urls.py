# ============================================================
# notifications/urls.py
# All routes prefixed with /api/notifications/
# ============================================================

from django.urls import path
from . import views

urlpatterns = [

    # GET /api/notifications/ → get my notifications
    path('', views.MyNotificationsView.as_view()),

    # PUT /api/notifications/<id>/read/ → mark notification as read
    path('<int:notification_id>/read/', views.MarkAsReadView.as_view()),

    # POST /api/notifications/critical/ → trigger critical alert to doctor
    path('critical/', views.CriticalAlertView.as_view()),
]