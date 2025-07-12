from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, F
from .models import Item, ItemLike
from .serializers import (
    ItemListSerializer, ItemDetailSerializer, 
    ItemCreateUpdateSerializer, CategorySerializer, ItemStatsSerializer
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import ItemReport, Item
from .serializers import ItemReportSerializer


class ItemPagination(PageNumberPagination):
    """Custom pagination for items with frontend-friendly metadata"""
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50

    def get_paginated_response(self, data):
        return Response({
            'results': data,
            'pagination': {
                'count': self.page.paginator.count,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'current_page': self.page.number,
                'total_pages': self.page.paginator.num_pages,
                'page_size': self.page_size
            }
        })

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission: object owner can edit, others can only read"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only authenticated users can modify objects
        if not request.user.is_authenticated:
            return False
        return obj.owner == request.user

class ItemViewSet(viewsets.ModelViewSet):
    """
    🧥 ITEMS API - Complete clothing item management
    
    Provides CRUD operations and specialized endpoints for the ReWear platform.
    All items must be approved by admin before appearing in public listings.
    """
    
    pagination_class = ItemPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    # 🔍 SEARCH & FILTERING
    search_fields = ['title', 'description', 'tags', 'brand', 'color']
    ordering_fields = ['created_at', 'view_count', 'like_count', 'point_value']
    ordering = ['-created_at']

    def get_queryset(self):
        """Base queryset - all available items (auto-approved, excluding flagged ones)"""
        return Item.objects.filter(
            is_approved=True,
            is_flagged=False, 
            status='available'
        ).select_related('owner').prefetch_related('images')

    def get_serializer_class(self):
        """Choose appropriate serializer based on action"""
        if self.action == 'list':
            return ItemListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ItemCreateUpdateSerializer
        else:
            return ItemDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        """
        📱 GET /api/items/{id}/
        
        Fetch detailed item information with all images and metadata.
        Automatically increments view count.
        
        Response includes:
        - Full item details
        - All images with URLs
        - Owner information
        - Like status for authenticated users
        - Swap eligibility
        """
        instance = self.get_object()
        
        # Increment view count (non-blocking)
        try:
            Item.objects.filter(id=instance.id).update(view_count=F('view_count') + 1)
        except:
            pass  # Don't fail if view count update fails
            
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='featured')
    def featured(self, request):
        """
        ⭐ GET /api/items/featured/
        
        Get featured items for homepage carousel and promotion.
        Returns max 10 featured items, ordered by most recent.
        
        Perfect for:
        - Homepage hero section
        - Featured items carousel
        - Promotional displays
        """
        featured_items = self.get_queryset().filter(is_featured=True)[:10]
        serializer = ItemListSerializer(featured_items, many=True, context={'request': request})
        return Response({
            'results': serializer.data,
            'count': featured_items.count()
        })

    @action(detail=False, methods=['get'], url_path='my', permission_classes=[permissions.IsAuthenticated])
    def my_items(self, request):
        """
        👤 GET /api/items/my/
        
        Get current user's items (all statuses, including pending approval).
        Includes draft, pending, approved, and rejected items.
        
        Response includes:
        - User's uploaded items
        - Approval status
        - Edit capabilities
        """
        user_items = Item.objects.filter(owner=request.user).prefetch_related('images')
        page = self.paginate_queryset(user_items)
        
        if page is not None:
            serializer = ItemListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
            
        serializer = ItemListSerializer(user_items, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='categories')
    def categories(self, request):
        """
        📂 GET /api/items/categories/
        
        Get all available item categories for frontend dropdowns.
        Returns category choices with values and display labels.
        
        Perfect for:
        - Category dropdown in forms
        - Filter options
        - Category navigation
        """
        categories = [
            {'value': choice[0], 'label': choice[1]} 
            for choice in Item.Category.choices
        ]
        return Response({
            'categories': categories,
            'conditions': [
                {'value': choice[0], 'label': choice[1]} 
                for choice in Item.Condition.choices
            ]
        })

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        📊 GET /api/items/stats/
        
        Get platform statistics for dashboards and analytics.
        
        Returns:
        - Total items count
        - Items by status
        - Featured items count
        """
        stats = {
            'total_items': Item.objects.filter(is_approved=True).count(),
            'available_items': Item.objects.filter(is_approved=True, status='available').count(),
            'swapped_items': Item.objects.filter(status='swapped').count(),
            'pending_items': Item.objects.filter(status='pending').count(),
            'featured_items': Item.objects.filter(is_featured=True).count(),
        }
        return Response(stats)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        """
        ❤️ POST /api/items/{id}/like/
        
        Toggle like/favorite status for an item.
        Creates or removes like based on current status.
        
        Response:
        - liked: boolean (current status)
        - like_count: integer (total likes)
        """
        item = self.get_object()
        
        if item.owner == request.user:
            return Response(
                {'error': 'You cannot like your own item'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        like_obj, created = ItemLike.objects.get_or_create(
            user=request.user, 
            item=item
        )
        
        if not created:
            # Unlike - remove the like
            like_obj.delete()
            liked = False
        else:
            liked = True
        
        # Update like count
        item.like_count = item.likes.count()
        item.save(update_fields=['like_count'])
        
        return Response({
            'liked': liked,
            'like_count': item.like_count
        })

    @action(detail=False, methods=['get'], url_path='search')
    def advanced_search(self, request):
        """
        🔍 GET /api/items/search/
        
        Advanced search with multiple filters and sorting options.
        
        Query Parameters:
        - q: Search term (title, description, tags, brand)
        - category: Filter by category
        - condition: Filter by condition  
        - min_points: Minimum point value
        - max_points: Maximum point value
        - size: Filter by size
        - color: Filter by color
        - sort: Sort order (newest, oldest, popular, points_low, points_high)
        
        Example: /api/items/search/?q=vintage&category=tops&sort=popular
        """
        queryset = self.get_queryset()
        
        # Text search
        search_query = request.query_params.get('q', '')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(tags__icontains=search_query) |
                Q(brand__icontains=search_query) |
                Q(color__icontains=search_query)
            )
        
        # Filters
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
            
        condition = request.query_params.get('condition')
        if condition:
            queryset = queryset.filter(condition=condition)
            
        size = request.query_params.get('size')
        if size:
            queryset = queryset.filter(size__iexact=size)
            
        color = request.query_params.get('color')
        if color:
            queryset = queryset.filter(color__icontains=color)
        
        # Point range
        min_points = request.query_params.get('min_points')
        max_points = request.query_params.get('max_points')
        if min_points:
            queryset = queryset.filter(point_value__gte=min_points)
        if max_points:
            queryset = queryset.filter(point_value__lte=max_points)
        
        # Sorting
        sort_option = request.query_params.get('sort', 'newest')
        sort_mapping = {
            'newest': '-created_at',
            'oldest': 'created_at',
            'popular': '-like_count',
            'most_viewed': '-view_count',
            'points_low': 'point_value',
            'points_high': '-point_value'
        }
        
        if sort_option in sort_mapping:
            queryset = queryset.order_by(sort_mapping[sort_option])
        
        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ItemListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
            
        serializer = ItemListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        📝 POST /api/items/
        
        Create a new item listing. Requires authentication.
        Items are created in pending status awaiting admin approval.
        
        Required fields:
        - title: Item title
        - description: Item description
        - category: Item category
        - size: Item size
        - condition: Item condition
        - uploaded_images: At least 1 image file
        
        Optional fields:
        - point_value: Points required (default: 10)
        - tags_list: Array of tags
        - color: Primary color
        - brand: Brand name
        """
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        ✏️ PUT/PATCH /api/items/{id}/
        
        Update an existing item. Only the owner can edit.
        Updated items may require re-approval depending on changes.
        """
        return super().update(request, *args, **kwargs)



