from django.urls import path
from .views import reported_items,clear_reported_item

urlpatterns = [
    path('reported/items', reported_items, name='reported_items'),
    path('reported/items/clear/<int:item_id>', clear_reported_item, name='clear_reported_item'),
]
