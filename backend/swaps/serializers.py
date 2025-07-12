from rest_framework import serializers
from .models import SwapRequest
from items.serializers import ItemListSerializer
from users.serializers import PublicUserSerializer

class SwapRequestSerializer(serializers.ModelSerializer):
    """Detailed serializer for swap requests"""
    requester = PublicUserSerializer(read_only=True)
    requested_item = ItemListSerializer(read_only=True)
    offered_item = ItemListSerializer(read_only=True)
    
    class Meta:
        model = SwapRequest
        fields = (
            'id', 'requester', 'requested_item', 'offered_item', 
            'status', 'message', 'created_at', 'updated_at'
        )

class SwapRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating swap requests"""
    
    class Meta:
        model = SwapRequest
        fields = ('requested_item', 'offered_item', 'message')
    
    def validate(self, data):
        """Validate swap request data"""
        requested_item = data['requested_item']
        offered_item = data['offered_item']
        
        # Check if user is trying to swap with themselves
        if requested_item.owner == self.context['request'].user:
            raise serializers.ValidationError("You cannot request a swap for your own item")
        
        # Check if offered item belongs to the user
        if offered_item.owner != self.context['request'].user:
            raise serializers.ValidationError("You can only offer items that you own")
        
        # Check if items are available
        if requested_item.status != 'available':
            raise serializers.ValidationError("The requested item is not available for swap")
            
        if offered_item.status != 'available':
            raise serializers.ValidationError("Your offered item is not available for swap")
        
        # Check if both items are approved
        if not requested_item.is_approved:
            raise serializers.ValidationError("The requested item is not approved")
            
        if not offered_item.is_approved:
            raise serializers.ValidationError("Your offered item is not approved")
        
        # Check for duplicate swap requests
        existing_swap = SwapRequest.objects.filter(
            requester=self.context['request'].user,
            requested_item=requested_item,
            offered_item=offered_item,
            status='pending'
        ).exists()
        
        if existing_swap:
            raise serializers.ValidationError("You already have a pending swap request for this combination")
        
        return data
    
    def create(self, validated_data):
        validated_data['requester'] = self.context['request'].user
        return super().create(validated_data)
