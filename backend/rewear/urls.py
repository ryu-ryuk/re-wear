from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", lambda r: JsonResponse({"status": "rewear backend running"})),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

