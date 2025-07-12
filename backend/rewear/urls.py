from django.contrib import admin
from django.urls import path , include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", lambda r: JsonResponse({"status": "rewear backend running"})),

    # djoser URLs
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),

]


