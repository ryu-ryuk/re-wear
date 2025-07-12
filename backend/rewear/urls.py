from django.contrib import admin
from django.urls import path , include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", lambda r: JsonResponse({"status": "rewear backend running"})),

    # DJOSER auth endpoints
    path('api/auth/', include('djoser.urls')),          # user, register, me
    path('api/auth/', include('djoser.urls.jwt')),      # login, refresh, logout
]


