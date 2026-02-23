import os
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from allauth.account.models import EmailAddress, EmailConfirmationHMAC, EmailConfirmation
from allauth.account.internal.flows.email_verification import (
    send_verification_email_for_user,
    send_verification_email_to_address,
)

from .serializers import (
    SignupSerializer,
    LoginSerializer,
    ResendVerificationSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    UserSerializer,
)

User = get_user_model()


def _ok(data=None, message=None, status=200):
    body = {"success": True}
    if data is not None:
        body["data"] = data
    if message:
        body["message"] = message
    return Response(body, status=status)


def _err(message, errors=None, status=400):
    body = {"success": False, "message": message}
    if errors:
        body["errors"] = errors
    return Response(body, status=status)


def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ─── Signup ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    POST /auth/signup
    Body: { "email": "...", "password1": "...", "password2": "..." }
    """
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        # Extract the first error message for better UX
        errors = serializer.errors
        if 'email' in errors:
            error_msg = errors['email'][0] if isinstance(errors['email'], list) else str(errors['email'])
        elif 'password1' in errors:
            error_msg = errors['password1'][0] if isinstance(errors['password1'], list) else str(errors['password1'])
        elif 'password2' in errors:
            error_msg = errors['password2'][0] if isinstance(errors['password2'], list) else str(errors['password2'])
        else:
            error_msg = "Signup failed. Please check your input."
        return _err(error_msg, serializer.errors, 400)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password1']

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        is_active=True,
    )

    email_address = EmailAddress.objects.create(
        user=user, email=email, primary=True, verified=False
    )
    
    try:
        send_verification_email_to_address(request, email_address, signup=True)
    except Exception as e:
        # Log the error but don't fail the signup
        print(f"Failed to send verification email: {str(e)}")

    return _ok(
        {"email": user.email},
        "Account created. Please check your email to verify your account.",
        201,
    )


# ─── Login ────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    POST /auth/login
    Body: { "email": "...", "password": "..." }
    Returns JWT access + refresh tokens.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return _err("Invalid input.", serializer.errors, 400)

    email = serializer.validated_data['email'].lower().strip()
    password = serializer.validated_data['password']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return _err("Invalid email or password.", status=401)

    if not user.check_password(password):
        return _err("Invalid email or password.", status=401)

    if not user.is_active:
        return _err("Account is disabled.", status=403)

    # Check email verification only if required by settings
    if getattr(settings, 'REQUIRE_EMAIL_VERIFICATION', True):
        email_addr = EmailAddress.objects.filter(user=user, primary=True).first()
        if email_addr and not email_addr.verified:
            return _err(
                "Email not verified. Please check your inbox and verify your email before logging in.",
                status=403,
            )

    tokens = _tokens_for_user(user)
    return _ok({
        "user": UserSerializer(user).data,
        "tokens": tokens,
    })


# ─── Logout ───────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    POST /auth/logout
    Body: { "refresh": "..." }
    Blacklists the refresh token.
    """
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return _err("Refresh token is required.", status=400)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError as e:
        return _err(str(e), status=400)
    return _ok(message="Logged out successfully.")


# ─── Email Verification ───────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, key):
    """
    GET /auth/verify-email/<key>
    Verifies the email address using the allauth HMAC key.
    """
    confirmation = EmailConfirmationHMAC.from_key(key)

    if confirmation is None:
        try:
            confirmation = EmailConfirmation.objects.get(key=key.lower())
        except EmailConfirmation.DoesNotExist:
            return _err("Invalid or expired verification link.", status=400)

    confirmation.confirm(request)
    return _ok(message="Email verified successfully. You can now log in.")


# ─── Resend Verification ──────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification(request):
    """
    POST /auth/resend-verification
    Body: { "email": "..." }
    """
    serializer = ResendVerificationSerializer(data=request.data)
    if not serializer.is_valid():
        return _err("Invalid input.", serializer.errors, 400)

    email = serializer.validated_data['email'].lower().strip()

    # Always return the same message to prevent email enumeration
    generic_msg = "If this email is registered and unverified, a verification email has been sent."

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return _ok(message=generic_msg)

    email_addr = EmailAddress.objects.filter(user=user, email=email, verified=False).first()
    if not email_addr:
        return _ok(message=generic_msg)

    try:
        send_verification_email_to_address(request, email_addr)
    except Exception as e:
        print(f"Failed to resend verification email: {str(e)}")
    
    return _ok(message="Verification email resent. Please check your inbox.")


# ─── Password Reset Request ───────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    """
    POST /auth/password/reset
    Body: { "email": "..." }
    """
    serializer = PasswordResetSerializer(data=request.data)
    if not serializer.is_valid():
        return _err("Invalid input.", serializer.errors, 400)

    email = serializer.validated_data['email'].lower().strip()
    generic_msg = "If this email is registered, a password reset link has been sent."

    try:
        user = User.objects.get(email=email, is_active=True)
    except User.DoesNotExist:
        return _ok(message=generic_msg)

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    
    # Generate frontend URL instead of backend API URL
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    reset_url = f"{frontend_url}/auth/reset-password-confirm?uid={uid}&token={token}"

    from django.core.mail import send_mail
    try:
        send_mail(
            subject="Password Reset – Resume Analyzer",
            message=(
                f"Click the link below to reset your password:\n\n"
                f"{reset_url}\n\n"
                f"If you did not request this, you can safely ignore this email."
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Failed to send password reset email: {str(e)}")

    return _ok(message=generic_msg)


# ─── Password Reset Confirm ───────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    POST /auth/password/reset/confirm
    Body: { "uid": "...", "token": "...", "new_password1": "...", "new_password2": "..." }
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if not serializer.is_valid():
        return _err("Invalid input.", serializer.errors, 400)

    try:
        uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, User.DoesNotExist):
        return _err("Invalid reset link.", status=400)

    if not default_token_generator.check_token(user, serializer.validated_data['token']):
        return _err("Invalid or expired reset link.", status=400)

    user.set_password(serializer.validated_data['new_password1'])
    user.save()
    
    # Auto-verify email when password is reset successfully
    # (User proved they have access to the email by clicking the reset link)
    email_addr = EmailAddress.objects.filter(user=user, email=user.email).first()
    if email_addr and not email_addr.verified:
        email_addr.verified = True
        email_addr.save()

    return _ok(message="Password has been reset successfully. You can now log in.")


# ─── Token Refresh ────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    """
    POST /auth/token/refresh
    Body: { "refresh": "..." }
    Returns a new access token.
    """
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return _err("Refresh token is required.", status=400)
    try:
        token = RefreshToken(refresh_token)
        return _ok({"access": str(token.access_token)})
    except TokenError as e:
        return _err(str(e), status=401)


# ─── Me ───────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    GET /auth/me
    Returns the currently authenticated user.
    """
    return _ok(UserSerializer(request.user).data)
