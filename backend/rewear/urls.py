from django.contrib import admin
from django.urls import path , include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi



schema_view = get_schema_view(
    openapi.Info(
        title="ReWear API",
        default_version='v1',
        description="API documentation for the ReWear app",
        contact=openapi.Contact(email="team@rewear.dev"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", lambda r: JsonResponse({"status": "rewear backend running"})),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),


    # DJOSER auth endpoints
    path('auth/', include('djoser.urls')),          # user, register, me
    path('auth/', include('djoser.urls.jwt')),      # login, refresh, logout
    path('api/', include('djoser.urls')),
    path('api/', include('djoser.urls.authtoken')),
    # DJOSER auth endpoints (keeping for JWT refresh)
    path('auth/', include('djoser.urls.jwt')),      # JWT refresh, verify, blacklist

    # ReWear API endpoints
    path('api/', include('users.urls')),           # User management, auth, dashboard
    path('api/items/', include('items.urls')),     # Item listings, search, management
    path('api/swaps/', include('swaps.urls')),     # Swap requests and negotiations
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
# to serve media files in dev
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
