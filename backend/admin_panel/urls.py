from django.urls import path
from .views import reported_items

urlpatterns = [
    path('reported/items', reported_items, name='reported_items'),
]
