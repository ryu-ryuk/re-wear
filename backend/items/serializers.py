from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Item, ItemImage, ItemLike, ItemReport

User = get_user_model()

class ItemImageSerializer(serializers.ModelSerializer):
    """Serializer for item images with frontend-friendly URLs"""
    class Meta:
        model = ItemImage
        fields = ('id', 'image', 'alt_text', 'is_primary', 'order')

class ItemOwnerSerializer(serializers.ModelSerializer):
    """Limited user info for item listings - privacy friendly"""
    class Meta:
        model = User
        fields = ('id', 'username', 'points')

class ItemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for item lists/grids - optimized for frontend"""
    owner = ItemOwnerSerializer(read_only=True)
    tags_list = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = (
            'id', 'title', 'category', 'size', 'condition', 'status',
            'point_value', 'color', 'brand', 'view_count', 'like_count',
            'is_featured', 'created_at', 'primary_image', 'owner',
            'tags_list', 'is_liked'
        )

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def get_is_liked(self, obj):
        """Check if current user has liked this item"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ItemLike.objects.filter(user=request.user, item=obj).exists()
        return False

    def get_primary_image(self, obj):
        """Get the primary image or first image for quick display"""
        primary_img = obj.images.filter(is_primary=True).first()
        if not primary_img:
            primary_img = obj.images.first()
        
        if primary_img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_img.image.url)
        return None

class ItemDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single item view"""
    images = ItemImageSerializer(many=True, read_only=True)
    owner = ItemOwnerSerializer(read_only=True)
    tags_list = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_swap_request = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = (
            'id', 'title', 'description', 'category', 'size', 'condition', 
            'status', 'point_value', 'tags_list', 'color', 'brand',
            'view_count', 'like_count', 'is_featured', 'created_at', 
            'updated_at', 'images', 'owner', 'is_liked', 'can_edit',
            'can_swap_request'
        )

    def get_tags_list(self, obj):
        return obj.get_tags_list()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ItemLike.objects.filter(user=request.user, item=obj).exists()
        return False

    def get_can_edit(self, obj):
        """Check if current user can edit this item"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.owner == request.user
        return False

    def get_can_swap_request(self, obj):
        """Check if current user can request a swap for this item"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return (obj.owner != request.user and 
                obj.status == 'available' and 
                obj.is_approved)
        return False

class ItemCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating items"""
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    tags_list = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )

    class Meta:
        model = Item
        fields = (
            'title', 'description', 'category', 'size', 'condition',
            'point_value', 'tags_list', 'color', 'brand', 'uploaded_images'
        )

    def validate_point_value(self, value):
        """Ensure point value is reasonable"""
        if value < 1 or value > 100:
            raise serializers.ValidationError("Point value must be between 1 and 100")
        return value

    def validate_uploaded_images(self, value):
        """Validate image uploads"""
        if len(value) > 5:
            raise serializers.ValidationError("Maximum 5 images allowed per item")
        return value

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        tags_list = validated_data.pop('tags_list', [])
        
        # Set owner from request context
        validated_data['owner'] = self.context['request'].user
        
        # Convert tags list to comma-separated string
        if tags_list:
            validated_data['tags'] = ', '.join(tags_list)
        
        item = Item.objects.create(**validated_data)
        
        # Create images
        for index, image in enumerate(uploaded_images):
            ItemImage.objects.create(
                item=item, 
                image=image, 
                order=index,
                is_primary=(index == 0)  # First image is primary
            )
            
        return item

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        tags_list = validated_data.pop('tags_list', [])
        
        # Update tags
        if tags_list:
            validated_data['tags'] = ', '.join(tags_list)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle new images if provided
        if uploaded_images:
            # Get current image count
            current_count = instance.images.count()
            for index, image in enumerate(uploaded_images):
                ItemImage.objects.create(
                    item=instance, 
                    image=image, 
                    order=current_count + index
                )
        
        return instance

class CategorySerializer(serializers.Serializer):
    """Serializer for category choices - helps frontend build dropdowns"""
    value = serializers.CharField()
    label = serializers.CharField()

class ItemStatsSerializer(serializers.Serializer):
    """Serializer for item statistics - useful for dashboards"""
    total_items = serializers.IntegerField()
    available_items = serializers.IntegerField()
    swapped_items = serializers.IntegerField()
    pending_items = serializers.IntegerField()
    featured_items = serializers.IntegerField()



class ItemReportSerializer(serializers.ModelSerializer):
    # optional nested read-only fields
    item_title = serializers.CharField(source='item.title', read_only=True)
    reported_by_username = serializers.CharField(source='reported_by.username', read_only=True)

    class Meta:
        model = ItemReport
        fields = [
            'id',
            'item',
            'item_title',
            'reported_by',
            'reported_by_username',
            'reason',
            'created_at',
            'resolved',
            'reviewed_by',
        ]

class ItemReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemReport
        fields = ['item', 'reason']
