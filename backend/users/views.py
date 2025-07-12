from django.contrib.auth import authenticate
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from items.models import Item, ItemLike
from items.serializers import ItemListSerializer
from swaps.models import SwapRequest
from .models import User
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer, UserDashboardStatsSerializer,
    PublicUserSerializer, UserUpdateSerializer
)

class UserViewSet(ModelViewSet):
    """
    👤 USER MANAGEMENT API - Complete user profile and dashboard
    
    Provides user registration, profile management, and comprehensive dashboard data.
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            # Only check if it's another user's profile if we have a pk and user is authenticated
            try:
                if (self.kwargs.get('pk') and 
                    self.request.user.is_authenticated and 
                    self.get_object() != self.request.user):
                    return PublicUserSerializer
            except:
                pass  # If get_object fails, use default serializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserProfileSerializer

    def get_permissions(self):
        """Allow public access to retrieve other users, require auth for own profile"""
        if self.action == 'retrieve':
            return [AllowAny()]
        return [IsAuthenticated()]

    def retrieve(self, request, pk=None):
        """
        👤 GET /api/users/{id}/
        
        Get user profile information.
        - Public users see limited info based on privacy settings
        - Own profile shows full details
        """
        user = self.get_object()
        
        # Check if user has made their profile private (only for authenticated users)
        if (user.is_private and 
            (not request.user.is_authenticated or user != request.user)):
            return Response(
                {'detail': 'This user has made their profile private'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        👤 GET /api/users/me/
        
        Get current user's complete profile information.
        """
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard(self, request):
        """
        📊 GET /api/users/dashboard/
        
        Get comprehensive dashboard statistics for the current user.
        
        Returns:
        - Point balance and earnings
        - Item statistics (total, pending, available, swapped)
        - Engagement metrics (views, likes)
        - Swap activity
        - Recent activity
        """
        user = request.user
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # Calculate comprehensive stats
        user_items = user.items.all()
        
        # Point stats (placeholder for future point earning system)
        total_points = user.points
        points_earned_this_month = 0  # TODO: Implement point earning tracking

        # Item statistics
        total_items = user_items.count()
        flagged_items = user_items.filter(is_flagged=True).count()
        available_items = user_items.filter(status='available', is_approved=True).count()
        swapped_items = user_items.filter(status='swapped').count()

        # Engagement statistics
        total_views = user_items.aggregate(total=Sum('view_count'))['total'] or 0
        total_likes = user_items.aggregate(total=Sum('like_count'))['total'] or 0
        profile_views = 0  # TODO: Implement profile view tracking

        # Swap statistics
        swaps_requested = SwapRequest.objects.filter(requester=user).count()
        swaps_received = SwapRequest.objects.filter(requested_item__owner=user).count()
        successful_swaps = SwapRequest.objects.filter(
            Q(requester=user) | Q(requested_item__owner=user),
            status='completed'
        ).count()
        active_negotiations = SwapRequest.objects.filter(
            Q(requester=user) | Q(requested_item__owner=user),
            status__in=['pending', 'accepted']
        ).count()

        # Recent activity (placeholder - would need activity tracking)
        new_likes_this_week = 0  # TODO: Track like timestamps
        new_views_this_week = 0  # TODO: Track view timestamps

        stats_data = {
            'total_points': total_points,
            'points_earned_this_month': points_earned_this_month,
            'total_items': total_items,
            'flagged_items': flagged_items,
            'available_items': available_items,
            'swapped_items': swapped_items,
            'total_views': total_views,
            'total_likes': total_likes,
            'profile_views': profile_views,
            'swaps_requested': swaps_requested,
            'swaps_received': swaps_received,
            'successful_swaps': successful_swaps,
            'active_negotiations': active_negotiations,
            'new_likes_this_week': new_likes_this_week,
            'new_views_this_week': new_views_this_week,
        }

        serializer = UserDashboardStatsSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_activity(self, request):
        """
        📈 GET /api/users/my_activity/
        
        Get recent activity for the user's dashboard.
        
        Returns:
        - Recent items uploaded
        - Recent likes received
        - Recent swap requests
        - Notifications/alerts
        """
        user = request.user
        
        # Recent items (last 5 uploaded)
        recent_items = user.items.filter(is_approved=True).order_by('-created_at')[:5]
        recent_items_data = ItemListSerializer(
            recent_items, many=True, context={'request': request}
        ).data

        # Recent swap requests (last 5 received)
        recent_swap_requests = SwapRequest.objects.filter(
            requested_item__owner=user
        ).order_by('-created_at')[:5]

        # TODO: Recent likes received (would need like timestamp tracking)
        recent_likes = []

        # TODO: Notifications (would need notification system)
        notifications = []

        return Response({
            'recent_items': recent_items_data,
            'recent_swap_requests': [
                {
                    'id': swap.id,
                    'requester': swap.requester.username,
                    'offered_item': swap.offered_item.title,
                    'requested_item': swap.requested_item.title,
                    'status': swap.status,
                    'created_at': swap.created_at
                } for swap in recent_swap_requests
            ],
            'recent_likes': recent_likes,
            'notifications': notifications
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_swaps(self, request):
        """
        🔄 GET /api/users/my_swaps/
        
        Get current user's swap activity (both requested and received).
        Essential for "My Purchases" section in dashboard.
        
        Response includes:
        - Swaps I requested (wanting others' items)
        - Swaps others requested from me 
        - Status of each swap (pending, accepted, completed, rejected)
        - Item details for each swap
        """
        user = request.user
        
        # Swaps the user has requested (wanting to get items)
        requested_swaps = SwapRequest.objects.filter(
            requester=user
        ).select_related(
            'requested_item', 'offered_item', 'requested_item__owner'
        ).order_by('-created_at')[:10]
        
        # Swaps others have requested from user's items
        received_swaps = SwapRequest.objects.filter(
            requested_item__owner=user
        ).select_related(
            'requester', 'requested_item', 'offered_item'
        ).order_by('-created_at')[:10]
        
        # Format the data for frontend
        requested_data = [
            {
                'id': swap.id,
                'type': 'requested',
                'status': swap.status,
                'created_at': swap.created_at,
                'updated_at': swap.updated_at,
                'message': swap.message,
                'item_wanted': {
                    'id': swap.requested_item.id,
                    'title': swap.requested_item.title,
                    'owner': swap.requested_item.owner.username,
                    'point_value': swap.requested_item.point_value,
                    'primary_image': request.build_absolute_uri(
                        swap.requested_item.images.filter(is_primary=True).first().image.url
                    ) if swap.requested_item.images.filter(is_primary=True).exists() else None
                },
                'item_offered': {
                    'id': swap.offered_item.id,
                    'title': swap.offered_item.title,
                    'point_value': swap.offered_item.point_value,
                    'primary_image': request.build_absolute_uri(
                        swap.offered_item.images.filter(is_primary=True).first().image.url
                    ) if swap.offered_item.images.filter(is_primary=True).exists() else None
                }
            } for swap in requested_swaps
        ]
        
        received_data = [
            {
                'id': swap.id,
                'type': 'received',
                'status': swap.status,
                'created_at': swap.created_at,
                'updated_at': swap.updated_at,
                'message': swap.message,
                'requester': {
                    'id': swap.requester.id,
                    'username': swap.requester.username,
                    'points': swap.requester.points
                },
                'my_item': {
                    'id': swap.requested_item.id,
                    'title': swap.requested_item.title,
                    'point_value': swap.requested_item.point_value,
                    'primary_image': request.build_absolute_uri(
                        swap.requested_item.images.filter(is_primary=True).first().image.url
                    ) if swap.requested_item.images.filter(is_primary=True).exists() else None
                },
                'offered_item': {
                    'id': swap.offered_item.id,
                    'title': swap.offered_item.title,
                    'point_value': swap.offered_item.point_value,
                    'primary_image': request.build_absolute_uri(
                        swap.offered_item.images.filter(is_primary=True).first().image.url
                    ) if swap.offered_item.images.filter(is_primary=True).exists() else None
                }
            } for swap in received_swaps
        ]
        
        return Response({
            'swaps_requested': requested_data,
            'swaps_received': received_data,
            'summary': {
                'total_requested': SwapRequest.objects.filter(requester=user).count(),
                'total_received': SwapRequest.objects.filter(requested_item__owner=user).count(),
                'pending_requests': SwapRequest.objects.filter(
                    requester=user, status='pending'
                ).count(),
                'pending_responses': SwapRequest.objects.filter(
                    requested_item__owner=user, status='pending'
                ).count(),
                'completed_swaps': SwapRequest.objects.filter(
                    Q(requester=user) | Q(requested_item__owner=user),
                    status='completed'
                ).count()
            }
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def complete_dashboard(self, request):
        """
        📊 GET /api/users/complete_dashboard/
        
        Get ALL dashboard data in one API call for efficiency.
        Perfect for loading the complete dashboard page.
        
        Returns:
        1. Personal Details (profile, email, points)
        2. My Listings (uploaded items with status)
        3. My Swaps (ongoing and completed swaps)
        4. Activity Summary
        """
        user = request.user
        
        # 1. Personal Details
        profile_data = UserProfileSerializer(user, context={'request': request}).data
        
        # 2. My Listings (latest 6 items)
        my_items = user.items.all().order_by('-created_at')[:6]
        my_items_data = ItemListSerializer(
            my_items, many=True, context={'request': request}
        ).data
        
        # 3. Recent Swaps Summary
        recent_swaps_requested = SwapRequest.objects.filter(
            requester=user
        ).order_by('-created_at')[:3]
        
        recent_swaps_received = SwapRequest.objects.filter(
            requested_item__owner=user
        ).order_by('-created_at')[:3]
        
        # 4. Quick Stats for Dashboard Cards
        stats = {
            'total_items': user.items.count(),
            'available_items': user.items.filter(status='available', is_approved=True).count(),
            'flagged_items': user.items.filter(is_flagged=True).count(),
            'total_views': user.items.aggregate(total=Sum('view_count'))['total'] or 0,
            'total_likes': user.items.aggregate(total=Sum('like_count'))['total'] or 0,
            'active_swaps': SwapRequest.objects.filter(
                Q(requester=user) | Q(requested_item__owner=user),
                status__in=['pending', 'accepted']
            ).count(),
            'completed_swaps': SwapRequest.objects.filter(
                Q(requester=user) | Q(requested_item__owner=user),
                status='completed'
            ).count()
        }
        
        return Response({
            'profile': profile_data,
            'my_items': my_items_data,
            'recent_swaps_requested': [
                {
                    'id': swap.id,
                    'item_title': swap.requested_item.title,
                    'status': swap.status,
                    'created_at': swap.created_at
                } for swap in recent_swaps_requested
            ],
            'recent_swaps_received': [
                {
                    'id': swap.id,
                    'item_title': swap.requested_item.title,
                    'requester': swap.requester.username,
                    'status': swap.status,
                    'created_at': swap.created_at
                } for swap in recent_swaps_received
            ],
            'stats': stats
        })
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def liked_items(self, request):
        """
        ❤️ GET /api/users/liked_items/
        
        Get all items the current user has liked.
        Useful for "My Favorites" section in dashboard.
        """
        liked_items = Item.objects.filter(
            likes__user=request.user,
            is_approved=True
        ).order_by('-likes__created_at')

        # Apply pagination if needed
        page = request.query_params.get('page', 1)
        page_size = min(int(request.query_params.get('page_size', 12)), 50)
        
        start = (int(page) - 1) * page_size
        end = start + page_size
        paginated_items = liked_items[start:end]

        serializer = ItemListSerializer(
            paginated_items, many=True, context={'request': request}
        )

        return Response({
            'results': serializer.data,
            'pagination': {
                'count': liked_items.count(),
                'current_page': int(page),
                'page_size': page_size,
                'has_next': end < liked_items.count(),
                'has_previous': int(page) > 1
            }
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    📝 POST /api/users/register/
    
    Register a new user account. Frontend handles password confirmation.
    
    SUCCESS RESPONSE (201):
    {
        "user": { ... user profile data ... },
        "tokens": {
            "refresh": "jwt_refresh_token",
            "access": "jwt_access_token"
        },
        "message": "Account created successfully! Welcome to ReWear! You received 100 bonus points!"
    }
    
    ERROR RESPONSE (400):
    {
        "message": "Invalid request. Please check your information and try again."
    }
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Account created successfully! Welcome to ReWear! You received 100 bonus points!'
        }, status=status.HTTP_201_CREATED)
    
    # Return simple error message instead of field-specific errors
    return Response({
        'message': 'Invalid request. Please check your information and try again.'
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    🔐 POST /api/users/login/
    
    Login with username/email and password.
    
    SUCCESS RESPONSE (200):
    {
        "user": { ... user profile data ... },
        "tokens": {
            "refresh": "jwt_refresh_token",
            "access": "jwt_access_token"
        },
        "message": "Welcome back, John!"
    }
    
    ERROR RESPONSES (400/401):
    {
        "message": "Invalid credentials. Please check your username and password."
    }
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'message': 'Gimme both username and password, nyan?'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Try to authenticate with username or email
    user = authenticate(username=username, password=password)
    
    if not user:
        # Try with email if username didn't work
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': f'Welcome back, {user.first_name or user.username}!'
        })
    else:
        return Response(
            {'message': 'oops! invalid creds! Please check your username and password.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reported_by_me(request):
    """
    Return every Item that the current user has personally reported.
    """
    items = (
        Item.objects
            .filter(reports__reported_by=request.user)
            .distinct()
    )
    serializer = ItemListSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reported_about_me(request):
    """
    Return every Item that the current user OWNS and that
    other users have reported.
    """
    items= (
        Item.objects
            .filter(reports__item__owner=request.user)
            .distinct()
    )
    serializer = ItemListSerializer(items, many=True)
    return Response(serializer.data)


