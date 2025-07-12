from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, F
from django.conf import settings
from .models import Item, ItemLike, ItemImage, PlatformConfig
from .serializers import (
    ItemListSerializer, ItemDetailSerializer, 
    ItemCreateUpdateSerializer, CategorySerializer, ItemReportCreateSerializer, ItemStatsSerializer
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

    @action(detail=False, methods=['get'], url_path='featured', permission_classes=[permissions.AllowAny])
    def featured(self, request):
        """
        ⭐ GET /api/items/featured/?limit=6
        
        Get featured items for homepage and landing page.
        🔓 PUBLIC ENDPOINT - No authentication required for landing page.
        
        Strategy (Smart Fallback):
        1. First, get admin-featured items (is_featured=True) 
        2. If not enough, fill remaining slots with most liked items
        3. Returns exactly the requested number of items
        
        Query Parameters:
        - limit: Number of items to return (default: admin-configurable, max: 20)
        
        Perfect for:
        - Landing page hero section
        - Featured items carousel  
        - Marketing showcases
        
        Example: /api/items/featured/?limit=8
        """
        # Get admin-configured default count
        config = PlatformConfig.get_config()
        default_count = config.featured_items_count
        
        # Get number of items requested (default from admin config, max 20 for performance)
        try:
            limit = int(request.query_params.get('limit', default_count))
            limit = min(max(limit, 1), settings.FEATURED_ITEMS_MAX_COUNT)  # Clamp between 1 and max
        except (ValueError, TypeError):
            limit = default_count
        
        # Step 1: Get admin-featured items first (curated by admin)
        admin_featured = self.get_queryset().filter(is_featured=True).order_by('-created_at')
        
        # Step 2: If we need more items, get most liked items (algorithmic)
        featured_count = admin_featured.count()
        
        if featured_count < limit:
            # Get most liked items that aren't already admin-featured
            most_liked = self.get_queryset().exclude(
                id__in=admin_featured.values_list('id', flat=True)
            ).order_by('-like_count', '-view_count', '-created_at')
            
            # Combine admin featured + most liked to get requested amount
            remaining_needed = limit - featured_count
            additional_items = most_liked[:remaining_needed]
            
            # Combine the querysets
            featured_items = list(admin_featured) + list(additional_items)
        else:
            # We have enough admin-featured items, just take the requested amount
            featured_items = admin_featured[:limit]
        
        serializer = ItemListSerializer(featured_items, many=True, context={'request': request})
        return Response({
            'results': serializer.data,
            'count': len(featured_items),
            'limit': limit,
            'strategy': {
                'admin_featured': min(featured_count, limit),
                'algorithmic_popular': max(0, limit - featured_count),
                'total': len(featured_items)
            },
            'message': f'Featured items (admin curated + popular fallback)'
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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], 
            parser_classes=[MultiPartParser, FormParser], url_path='upload-image')
    def upload_image(self, request, pk=None):
        """
        📸 POST /api/items/{id}/upload-image/
        
        Upload an image for an item. Only item owner can upload images.
        
        Form Data:
        - image: Image file (required)
        - alt_text: Alt text for accessibility (optional)
        - is_primary: Set as primary image (optional, default: False)
        - order: Display order (optional, default: 0)
        
        Response: Created ItemImage data with image URL
        """
        item = self.get_object()
        
        # Check if user owns the item
        if item.owner != request.user:
            return Response(
                {'error': 'You can only upload images to your own items'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get uploaded image
        image_file = request.FILES.get('image')
        if not image_file:
            return Response(
                {'error': 'Image file is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create ItemImage
        item_image = ItemImage.objects.create(
            item=item,
            image=image_file,
            alt_text=request.data.get('alt_text', ''),
            is_primary=request.data.get('is_primary', 'false').lower() == 'true',
            order=int(request.data.get('order', 0))
        )
        
        # If this is set as primary, remove primary status from other images
        if item_image.is_primary:
            ItemImage.objects.filter(item=item).exclude(id=item_image.id).update(is_primary=False)
        
        return Response({
            'id': item_image.id,
            'image': request.build_absolute_uri(item_image.image.url),
            'alt_text': item_image.alt_text,
            'is_primary': item_image.is_primary,
            'order': item_image.order,
            'message': 'Image uploaded successfully'
        }, status=status.HTTP_201_CREATED)

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
        # Create the item using the parent method
        response = super().create(request, *args, **kwargs)
        
        # If creation was successful, return the full item details
        if response.status_code == 201:
            # Try to get item ID from response data first
            item_id = response.data.get('id')
            
            # If no ID in response, try to get the last created item by this user
            if not item_id:
                try:
                    item = self.get_queryset().filter(owner=request.user).latest('created_at')
                    item_id = item.id
                except Item.DoesNotExist:
                    pass
            
            if item_id:
                try:
                    item = self.get_queryset().get(id=item_id)
                    # Use the detail serializer to return complete item data
                    serializer = ItemDetailSerializer(item, context={'request': request})
                    response.data = serializer.data
                except Item.DoesNotExist:
                    pass
        
        return response

    def update(self, request, *args, **kwargs):
        """
        ✏️ PUT/PATCH /api/items/{id}/
        
        Update an existing item. Only the owner can edit.
        Updated items may require re-approval depending on changes.
        """
        return super().update(request, *args, **kwargs)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_item(request):
    """
    Allow an authenticated user to report an item.
    Expected body:
        {
          "item": <item_id>,
          "reason": "<text>"
        }
    """
    serializer = ItemReportCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # enforce unique_together: one report per user per item
    report, created = ItemReport.objects.get_or_create(
        item_id=serializer.validated_data['item'],
        reported_by=request.user,
        defaults={'reason': serializer.validated_data['reason']},
    )
    if not created:
        return Response(
            {'detail': 'You have already reported this item.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(serializer.data, status=status.HTTP_201_CREATED)
