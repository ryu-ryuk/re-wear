"""
🔄 SWAP API ENDPOINTS - ReWear Platform

Complete swap management system for item exchanges:

📝 SWAP MANAGEMENT
GET    /api/swaps/                    - List user's swap requests (sent & received)
POST   /api/swaps/                    - Create new swap request
GET    /api/swaps/{id}/               - Get swap request details
PUT    /api/swaps/{id}/               - Update swap request
DELETE /api/swaps/{id}/               - Delete swap request

🔄 SWAP ACTIONS
POST   /api/swaps/{id}/accept/        - Accept swap (item owner only)
POST   /api/swaps/{id}/reject/        - Reject swap (item owner only)
POST   /api/swaps/{id}/complete/      - Mark swap as completed (both parties)
POST   /api/swaps/{id}/cancel/        - Cancel swap (requester only)

💡 SWAP FLOW:
1. User A sees User B's item and wants to swap
2. User A creates swap request offering their item
3. User B (item owner) accepts or rejects
4. If accepted, both items become 'pending'
5. Both parties meet and complete the swap
6. Both users earn 5 points for successful swap

🔒 PERMISSIONS:
- Create swap: Authenticated users only
- Accept/Reject: Item owner only
- Complete: Both involved parties
- Cancel: Requester only (if pending)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SwapRequestViewSet

# Create router for swap requests
router = DefaultRouter()
router.register('', SwapRequestViewSet, basename='swap')

urlpatterns = [
    path('', include(router.urls)),
]

# Generated URL patterns:
# GET    /api/swaps/                    -> SwapRequestViewSet.list()
# POST   /api/swaps/                    -> SwapRequestViewSet.create()
# GET    /api/swaps/{id}/               -> SwapRequestViewSet.retrieve()
# PUT    /api/swaps/{id}/               -> SwapRequestViewSet.update()
# DELETE /api/swaps/{id}/               -> SwapRequestViewSet.destroy()
#
# Custom action endpoints:
# POST   /api/swaps/{id}/accept/        -> SwapRequestViewSet.accept()
# POST   /api/swaps/{id}/reject/        -> SwapRequestViewSet.reject()
# POST   /api/swaps/{id}/complete/      -> SwapRequestViewSet.complete()
# POST   /api/swaps/{id}/cancel/        -> SwapRequestViewSet.cancel()


