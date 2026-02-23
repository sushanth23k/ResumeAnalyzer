from django.urls import path
from . import views

urlpatterns = [
    path('signup', views.signup, name='auth_signup'),
    path('login', views.login, name='auth_login'),
    path('logout', views.logout, name='auth_logout'),
    path('me', views.me, name='auth_me'),
    path('verify-email/<str:key>', views.verify_email, name='auth_verify_email'),
    path('resend-verification', views.resend_verification, name='auth_resend_verification'),
    path('password/reset', views.password_reset, name='auth_password_reset'),
    path('password/reset/confirm', views.password_reset_confirm, name='auth_password_reset_confirm'),
    path('token/refresh', views.token_refresh, name='auth_token_refresh'),
]
