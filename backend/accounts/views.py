from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, LoginSerializer
from django.core import signing
import pyotp, qrcode, io, base64
from .models import Profile
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import status
from .serializers import PasswordResetRequestSerializer, PasswordResetConfirmSerializer
from django.conf import settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail

User = get_user_model()


@extend_schema(
    summary="Register a new user",
    description="Creates a new user account with username, email, and password.",
    request=RegisterSerializer,
    responses={
        201: OpenApiResponse(
            response={"message": "User registered successfully"},
            description="User was created successfully."
        ),
        400: OpenApiResponse(
            response={"username": ["This field is required."]},
            description="Validation error."
        )
    }
)
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@extend_schema(
    summary="Login user",
    description=(
        "Authenticates a user using username and password.\n"
        "- If MFA is disabled: returns JWT tokens directly.\n"
        "- If MFA is enabled: returns an MFA token and requires `/mfa/login/verify/`."
    ),
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(
            response={
                "mfa_required": False,
                "access": "<JWT_ACCESS_TOKEN>",
                "refresh": "<JWT_REFRESH_TOKEN>"
            },
            description="MFA disabled - tokens returned"
        ),
        200: OpenApiResponse(
            response={
                "mfa_required": True,
                "mfa_token": "<TEMPORARY_MFA_TOKEN>"
            },
            description="MFA enabled - MFA verification required"
        ),
        400: OpenApiResponse(
            response={"non_field_errors": ["Invalid credentials"]},
            description="Invalid username/password."
        )
    }
)    
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)
    
@extend_schema(
    summary="Get MFA setup QR code",
    description=(
        "Generates a TOTP secret for the user (if not already set) and returns a QR code "
        "to scan in an authenticator app."
    ),
    responses={
        200: OpenApiResponse(
            response={"qr_code": "data:image/png;base64,<BASE64_IMAGE>"},
            description="QR code generated successfully."
        )
    }
)    
class MFASetupView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        profile = user.profile
        
        if not profile.totp_secret:
            profile.totp_secret = pyotp.random_base32()
            profile.save()
            
        uri = pyotp.TOTP(profile.totp_secret).provisioning_uri(name=user.email, issuer_name="MyApp")
        img = qrcode.make(uri)
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_b64 = base64.b64encode(buffer.getvalue()).decode()
        return Response({'qr_code': f"data:image/png;base64,{img_b64}"})

@extend_schema(
    summary="Verify MFA setup",
    description="Verifies the 6-digit TOTP code during MFA setup. If valid, enables MFA for the user.",
    request={
        "type": "object",
        "properties": {
            "code": {"type": "string", "example": "123456"}
        },
        "required": ["code"]
    },
    responses={
        200: OpenApiResponse(
            response={"message": "MFA enabled successfully"},
            description="MFA setup completed."
        ),
        400: OpenApiResponse(
            response={"error": "Invalid code"},
            description="Invalid TOTP code."
        )
    }
)
class MFAVerifySetupView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code')
        totp = pyotp.TOTP(request.user.profile.totp_secret)
        if totp.verify(code):
            request.user.profile.mfa_enabled = True
            request.user.profile.save()
            return Response({"message": "MFA setup successful"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)
  
  
@extend_schema(
    summary="Verify MFA during login",
    description="Verifies a 6-digit TOTP code during login for users with MFA enabled, returning JWT tokens if valid.",
    request={
        "type": "object",
        "properties": {
            "code": {"type": "string", "example": "123456"},
            "mfa_token": {"type": "string", "example": "<TEMPORARY_MFA_TOKEN>"}
        },
        "required": ["code", "mfa_token"]
    },
    responses={
        200: OpenApiResponse(
            response={
                "access": "<JWT_ACCESS_TOKEN>",
                "refresh": "<JWT_REFRESH_TOKEN>"
            },
            description="MFA code verified - tokens returned."
        ),
        400: OpenApiResponse(
            response={"error": "Invalid code"},
            description="Invalid MFA token or TOTP code."
        )
    }
)  
class MFAVerifyLoginView(APIView):
    def post(self, request):
        code = request.data.get('code')
        mfa_token = request.data.get('mfa_token')
        try:
            data = signing.loads(mfa_token,max_age=300,salt='mfa-login')
            
        except Exception:
            return Response({"error": "Invalid or expired MFA token"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.get(id=data['user_id'])
        totp = pyotp.TOTP(user.profile.totp_secret)
        
        if totp.verify(code):
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
            
        return Response({"error": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)
            
            
            
@extend_schema(
    summary="Check MFA status for current user",
    description="Returns whether the authenticated user has Multi-Factor Authentication enabled.",
    responses={
        200: OpenApiResponse(
            response={"mfa_enabled": True},
            description="MFA status retrieved successfully."
        )
    }
)
class MFAStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"mfa_enabled": request.user.profile.mfa_enabled})
    
    
@extend_schema(summary="Request password reset",request=PasswordResetRequestSerializer)
class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        send_mail(
            "Password Reset Request",
            f"Click the link to reset your password: {reset_link}",
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )

        return Response({"detail": "Password reset email sent."}, status=status.HTTP_200_OK)


@extend_schema(summary="Confirm password reset",request=PasswordResetConfirmSerializer)
class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password has been reset."}, status=status.HTTP_200_OK)
