from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import SwapRequest
from .serializers import SwapRequestSerializer, SwapRequestCreateSerializer
from items.models import Item

class SwapRequestViewSet(viewsets.ModelViewSet):
    """
    🔄 SWAP REQUEST API - Handle item exchange requests
    
    Enables users to request item swaps and manage swap negotiations.
    Core feature for the ReWear platform's exchange system.
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get swap requests related to the current user"""
        user = self.request.user
        return SwapRequest.objects.filter(
            Q(requester=user) | Q(requested_item__owner=user)
        ).select_related(
            'requester', 'requested_item', 'offered_item'
        ).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SwapRequestCreateSerializer
        return SwapRequestSerializer
    
    def create(self, request, *args, **kwargs):
        """
        📝 POST /api/swaps/
        
        Create a new swap request.
        
        Required fields:
        - requested_item: ID of item user wants
        - offered_item: ID of item user is offering
        - message: Optional message to item owner
        """
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        ✅ POST /api/swaps/{id}/accept/
        
        Accept a swap request (item owner only).
        Updates both items to 'pending' status to prevent other swaps.
        """
        swap = self.get_object()
        
        # Only the item owner can accept
        if swap.requested_item.owner != request.user:
            return Response(
                {'error': 'Only the item owner can accept this swap'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if swap is still pending
        if swap.status != 'pending':
            return Response(
                {'error': 'This swap request is no longer pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if items are still available
        if (swap.requested_item.status != 'available' or 
            swap.offered_item.status != 'available'):
            return Response(
                {'error': 'One or both items are no longer available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Accept the swap
        swap.status = 'accepted'
        swap.save()
        
        # Update item statuses to prevent other swaps
        Item.objects.filter(id=swap.requested_item.id).update(status='pending')
        Item.objects.filter(id=swap.offered_item.id).update(status='pending')
        
        return Response({
            'message': 'Swap request accepted! Items are now reserved.',
            'swap': SwapRequestSerializer(swap, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        ❌ POST /api/swaps/{id}/reject/
        
        Reject a swap request (item owner only).
        """
        swap = self.get_object()
        
        # Only the item owner can reject
        if swap.requested_item.owner != request.user:
            return Response(
                {'error': 'Only the item owner can reject this swap'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if swap is still pending
        if swap.status != 'pending':
            return Response(
                {'error': 'This swap request is no longer pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reject the swap
        swap.status = 'rejected'
        swap.save()
        
        return Response({
            'message': 'Swap request rejected.',
            'swap': SwapRequestSerializer(swap, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        🎉 POST /api/swaps/{id}/complete/
        
        Mark swap as completed (both parties can do this).
        Updates items to 'swapped' status and awards points.
        """
        swap = self.get_object()
        
        # Only involved parties can complete
        if (request.user != swap.requester and 
            request.user != swap.requested_item.owner):
            return Response(
                {'error': 'Only involved parties can complete this swap'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if swap is accepted
        if swap.status != 'accepted':
            return Response(
                {'error': 'Swap must be accepted before it can be completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Complete the swap
        swap.status = 'completed'
        swap.save()
        
        # Update item statuses
        Item.objects.filter(id=swap.requested_item.id).update(status='swapped')
        Item.objects.filter(id=swap.offered_item.id).update(status='swapped')
        
        # Award points to both users (incentive for platform engagement)
        swap.requester.points += 5
        swap.requested_item.owner.points += 5
        swap.requester.save()
        swap.requested_item.owner.save()
        
        return Response({
            'message': 'Swap completed successfully! Both parties earned 5 points.',
            'swap': SwapRequestSerializer(swap, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        🔄 POST /api/swaps/{id}/cancel/
        
        Cancel a swap request (requester only, if pending).
        """
        swap = self.get_object()
        
        # Only the requester can cancel
        if swap.requester != request.user:
            return Response(
                {'error': 'Only the requester can cancel this swap'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Can only cancel pending swaps
        if swap.status != 'pending':
            return Response(
                {'error': 'Only pending swaps can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancel the swap
        swap.delete()
        
        return Response({
            'message': 'Swap request cancelled.'
        })
