from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from items.models import Item
from swaps.models import SwapRequest

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile information"""
    total_items = serializers.SerializerMethodField()
    items_swapped = serializers.SerializerMethodField()
    active_swaps = serializers.SerializerMethodField()
    total_likes_received = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'points', 'location', 'profile_picture', 'is_private',
            'date_joined', 'total_items', 'items_swapped', 'active_swaps',
            'total_likes_received'
        )
        read_only_fields = ('id', 'username', 'email', 'date_joined')

    def get_total_items(self, obj):
        return obj.items.filter(is_approved=True).count()

    def get_items_swapped(self, obj):
        return obj.items.filter(status='swapped').count()

    def get_active_swaps(self, obj):
        return SwapRequest.objects.filter(
            requester=obj, 
            status__in=['pending', 'accepted']
        ).count()

    def get_total_likes_received(self, obj):
        return sum(item.like_count for item in obj.items.all())

class UserDashboardStatsSerializer(serializers.Serializer):
    """Comprehensive dashboard statistics"""
    # Profile stats
    total_points = serializers.IntegerField()
    points_earned_this_month = serializers.IntegerField()
    
    # Item stats
    total_items = serializers.IntegerField()
    pending_approval = serializers.IntegerField()
    available_items = serializers.IntegerField()
    swapped_items = serializers.IntegerField()
    
    # Engagement stats
    total_views = serializers.IntegerField()
    total_likes = serializers.IntegerField()
    profile_views = serializers.IntegerField()
    
    # Swap stats
    swaps_requested = serializers.IntegerField()
    swaps_received = serializers.IntegerField()
    successful_swaps = serializers.IntegerField()
    active_negotiations = serializers.IntegerField()
    
    # Recent activity counts
    new_likes_this_week = serializers.IntegerField()
    new_views_this_week = serializers.IntegerField()

class PublicUserSerializer(serializers.ModelSerializer):
    """Limited user info for public display - privacy friendly"""
    total_items = serializers.SerializerMethodField()
    successful_swaps = serializers.SerializerMethodField()
    member_since = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'points', 'location', 
            'total_items', 'successful_swaps', 'member_since'
        )

    def get_total_items(self, obj):
        if obj.is_private:
            return None
        return obj.items.filter(is_approved=True, status='available').count()

    def get_successful_swaps(self, obj):
        if obj.is_private:
            return None
        return obj.items.filter(status='swapped').count()

    def get_member_since(self, obj):
        return obj.date_joined.strftime('%B %Y')

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'location', 
            'profile_picture', 'is_private'
        )

    def validate_location(self, value):
        if value and len(value) < 2:
            raise serializers.ValidationError("Location must be at least 2 characters long")
        return value

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Registration serializer without confirm_password - Frontend handles validation
    
    Error Response Format:
    {
        "username": ["A user with this username already exists."],
        "email": ["A user with this email already exists."],
        "password": ["This password is too short. It must contain at least 8 characters."]
    }
    
    Or for non-field errors:
    {
        "non_field_errors": ["Some general error message"]
    }
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'location')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        
        # Give welcome bonus points
        user.points = 100
        user.save()
        
        return user
