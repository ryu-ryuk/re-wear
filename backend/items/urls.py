from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet

# the router should automatically generates urls for the viewset
router = DefaultRouter()
router.register('', ItemViewSet, basename='item')

urlpatterns = [
    path('', include(router.urls)),
]

