from django.contrib import admin
from django.urls import path , include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", lambda r: JsonResponse({"status": "rewear backend running"})),

    # DJOSER auth endpoints
    path('auth/', include('djoser.urls')),          # user, register, me
    path('auth/', include('djoser.urls.jwt')),      # login, refresh, logout
    path('api/', include('djoser.urls')),
    path('api/', include('djoser.urls.authtoken')),

    # url path for items app
    path('api/items/', include('items.urls')),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
# to serve media files in dev
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
