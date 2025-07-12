from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Item
from .serializers import ItemSerializer, ItemCreateSerializer

# custom permission to check if the user is the owner TODO
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class ItemViewSet(viewsets.ModelViewSet):
    # queryset to only show approved and available items by default
    queryset = Item.objects.filter(is_approved=True, status='available').order_by('-created_at')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'category'] # for the /?search=... endpoint

    def get_serializer_class(self):
        # use a different serializer for the 'create' action
        if self.action == 'create':
            return ItemCreateSerializer
        return ItemSerializer

    # handles the GET /api/items/featured/ endpoint
    @action(detail=False, methods=['get'], url_path='featured')
    def featured(self, request):
        featured_items = self.get_queryset().filter(is_featured=True)
        serializer = self.get_serializer(featured_items, many=True)
        return Response(serializer.data)

    # handles the GET /api/items/my/ endpoint
    @action(detail=False, methods=['get'], url_path='my', permission_classes=[permissions.IsAuthenticated])
    def my_items(self, request):
        user_items = Item.objects.filter(owner=request.user).order_by('-created_at')
        serializer = self.get_serializer(user_items, many=True)
        return Response(serializer.data)
