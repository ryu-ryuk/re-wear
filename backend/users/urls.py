"""
👤 USER API ENDPOINTS - ReWear Platform

Complete user management system with authentication, profiles, and dashboard:

🔐 AUTHENTICATION
POST   /api/users/register/           - Register new user account (+ welcome bonus!)
POST   /api/users/login/              - Login with username/email + password

👤 PROFILE MANAGEMENT  
GET    /api/users/me/                 - Get current user's full profile
GET    /api/users/{id}/               - Get public user profile (respects privacy)
PUT    /api/users/{id}/               - Update user profile (own profile only)
PATCH  /api/users/{id}/               - Partial update user profile

📊 DASHBOARD & ANALYTICS
GET    /api/users/dashboard/          - Basic dashboard statistics
GET    /api/users/complete_dashboard/ - ALL dashboard data in one call
GET    /api/users/my_activity/        - Recent activity feed
GET    /api/users/my_swaps/           - Complete swap history (requests + received)
GET    /api/users/liked_items/        - User's favorite/liked items

💡 DASHBOARD FEATURES:
- Point balance and earnings tracking
- Item statistics (total, pending, available, swapped)  
- Engagement metrics (total views, likes received)
- Swap activity (requests sent/received, successful swaps)
- Recent activity feed
- Notifications and alerts

🔄 SWAP MANAGEMENT:
- View all swap requests made by user
- View all swap requests received by user
- Track swap status (pending, accepted, completed, rejected)
- Detailed item information for each swap
- Swap summary statistics

💡 NEW COMPLETE DASHBOARD ENDPOINT:
GET /api/users/complete_dashboard/ returns everything needed for dashboard:
{
  "profile": { user details, points, stats },
  "my_items": [ recent uploaded items ],
  "recent_swaps_requested": [ swaps user initiated ],
  "recent_swaps_received": [ swaps others requested ],
  "stats": { comprehensive metrics }
}

🔒 PRIVACY FEATURES:
- Users can set profile to private
- Private profiles hide statistics from public view
- Public profiles show limited, safe information

🎁 WELCOME BONUS:
- New users get 100 points to start swapping immediately!

📱 FRONTEND INTEGRATION EXAMPLES:

// Register new user
const registerUser = async (userData) => {
  const response = await fetch('/api/users/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'fashionlover',
      email: 'user@example.com', 
      password: 'securepass123',
      password_confirm: 'securepass123',
      first_name: 'Jane',
      location: 'New York'
    })
  });
  return response.json(); // { user: {...}, tokens: {...}, message: 'Welcome!' }
};

// Get dashboard data
const getDashboard = async (token) => {
  const response = await fetch('/api/users/dashboard/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json(); // Complete dashboard stats
};

// Get user's liked items
const getLikedItems = async (token) => {
  const response = await fetch('/api/users/liked_items/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json(); // Paginated liked items
};
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, register_user, login_user, reported_by_me, reported_about_me

# Create router for user viewset
router = DefaultRouter()
router.register('users', UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path('users/register/', register_user, name='register'),
    path('users/login/', login_user, name='login'),
    
    # User management endpoints (via viewset)
    path('', include(router.urls)),

    path('reported-by-me/', reported_by_me, name='reported_by_me'),
    path('reported-about-me/', reported_about_me, name='reported_about_me'),
]

# Generated URL patterns from router:
# GET    /api/users/                    -> UserViewSet.list() [Admin only]
# GET    /api/users/{id}/               -> UserViewSet.retrieve() [Public with privacy]
# PUT    /api/users/{id}/               -> UserViewSet.update() [Owner only]
# PATCH  /api/users/{id}/               -> UserViewSet.partial_update() [Owner only]
#
# Custom action endpoints:
# GET    /api/users/me/                 -> UserViewSet.me()
# GET    /api/users/dashboard/          -> UserViewSet.dashboard()
# GET    /api/users/my_activity/        -> UserViewSet.my_activity()
# GET    /api/users/liked_items/        -> UserViewSet.liked_items()


