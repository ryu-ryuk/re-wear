"""
🧥 ITEMS API ENDPOINTS - ReWear Platform

Frontend-friendly endpoints for clothing item management:

📋 ITEM LISTINGS
GET    /api/items/                    - List all approved, available items (paginated)
GET    /api/items/featured/           - Get featured items for homepage
GET    /api/items/my/                 - Get current user's items (requires auth)
GET    /api/items/categories/         - Get categories & conditions for dropdowns
GET    /api/items/stats/              - Get platform statistics
GET    /api/items/search/             - Advanced search with filters

📱 ITEM DETAILS  
GET    /api/items/{id}/               - Get detailed item info (increments view count)
POST   /api/items/                    - Create new item (requires auth + images)
PUT    /api/items/{id}/               - Update item (owner only)
PATCH  /api/items/{id}/               - Partial update item (owner only)
DELETE /api/items/{id}/               - Delete item (owner only)

❤️ ENGAGEMENT
POST   /api/items/{id}/like/          - Toggle like/favorite status (requires auth)

🔍 SEARCH PARAMETERS (for /api/items/ and /api/items/search/)
- search: Text search in title, description, tags, brand
- category: Filter by category (tops, bottoms, dresses, etc.)
- condition: Filter by condition (new, excellent, good, fair)
- size: Filter by size (S, M, L, etc.)
- color: Filter by color
- min_points: Minimum point value
- max_points: Maximum point value
- ordering: Sort by (created_at, -created_at, view_count, like_count, point_value)
- page: Page number (default: 1)
- page_size: Items per page (default: 12, max: 50)

💡 EXAMPLE REQUESTS
GET /api/items/?category=tops&ordering=-like_count&page=1&page_size=12
GET /api/items/search/?q=vintage&category=dresses&min_points=5&max_points=20
POST /api/items/{id}/like/
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, report_item

# Auto-generate RESTful URLs for the ItemViewSet
router = DefaultRouter()
router.register('', ItemViewSet, basename='item')

urlpatterns = [
    path('', include(router.urls)),
   # path('')
    path('items/report/', report_item, name='report_item')

]

# Generated URL patterns:
# /api/items/                     -> ItemViewSet.list()
# /api/items/create/              -> ItemViewSet.create() 
# /api/items/{id}/                -> ItemViewSet.retrieve()
# /api/items/{id}/update/         -> ItemViewSet.update()
# /api/items/{id}/partial_update/ -> ItemViewSet.partial_update()
# /api/items/{id}/delete/         -> ItemViewSet.destroy()
# 
# Custom action endpoints:
# /api/items/featured/            -> ItemViewSet.featured()
# /api/items/my/                  -> ItemViewSet.my_items()
# /api/items/categories/          -> ItemViewSet.categories()
# /api/items/stats/               -> ItemViewSet.stats()
# /api/items/search/              -> ItemViewSet.advanced_search()
# /api/items/{id}/like/           -> ItemViewSet.like()

