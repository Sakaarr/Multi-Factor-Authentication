from django.urls import path
from .views import RegisterView,MFAStatusView, LoginView, MFASetupView, MFAVerifySetupView, MFAVerifyLoginView, PasswordResetConfirmView, PasswordResetRequestView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('mfa/setup/', MFASetupView.as_view()),
    path('mfa/setup/verify/', MFAVerifySetupView.as_view()),
    path('mfa/login/verify/', MFAVerifyLoginView.as_view()),
    path('mfa/status/', MFAStatusView.as_view()),
    path("password-reset/request/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]