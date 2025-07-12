from rest_framework import serializers
from .models import Item, ItemImage

# to handles multiple image uploads
class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ('id', 'image')

class ItemSerializer(serializers.ModelSerializer):
    images = ItemImageSerializer(many=True, read_only=True)
    # allows the owner's email to be displayed
    owner = serializers.StringRelatedField() 

    class Meta:
        model = Item
        fields = (
            'id', 'owner', 'title', 'description', 'category', 'size', 
            'condition', 'status', 'is_featured', 'created_at', 'images'
        )

# serializer for creating/updating an item, including image uploads
class ItemCreateSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True
    )

    class Meta:
        model = Item
        fields = (
            'title', 'description', 'category', 'size', 
            'condition', 'uploaded_images'
        )

    def create(self, validated_data):
        # get the uploaded images from the validated data
        uploaded_images = validated_data.pop('uploaded_images')
        # set the owner from the request context
        validated_data['owner'] = self.context['request'].user
        item = Item.objects.create(**validated_data)
        
        # create an ItemImage object for each uploaded image
        for image in uploaded_images:
            ItemImage.objects.create(item=item, image=image)
            
        return item

