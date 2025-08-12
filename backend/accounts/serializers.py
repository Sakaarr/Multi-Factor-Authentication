from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import Profile
from django.core import signing
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        if user.profile.mfa_enabled:
            mfa_token = signing.dumps({'user_id': user.id}, salt='mfa-login')
            return {'mfa_required': True, 'mfa_token': mfa_token}
        
        else:
            refresh = RefreshToken.for_user(user)
            return {
                'mfa_required': False,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
            
            
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        try:
            uid = force_str(urlsafe_base64_decode(data["uidb64"]))
            self.user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uidb64": "Invalid user ID"})

        if not default_token_generator.check_token(self.user, data["token"]):
            raise serializers.ValidationError({"token": "Invalid or expired token"})

        return data

    def save(self):
        self.user.set_password(self.validated_data["new_password"])
        self.user.save()