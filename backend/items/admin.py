from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Item, ItemImage, ItemLike

class ItemImageInline(TabularInline):
    model = ItemImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'order')
    ordering = ['order', 'id']

@admin.register(Item)
class ItemAdmin(ModelAdmin):
    inlines = [ItemImageInline]

    # Enhanced list display with new fields
    list_display = (
        'title', 
        'owner', 
        'category',
        'point_value',
        'status', 
        'condition', 
        'view_count',
        'like_count',
        'is_approved', 
        'is_featured',
        'created_at'
    )

    # Quick edit fields from list view
    list_editable = (
        'status', 
        'is_approved', 
        'is_featured',
        'point_value'
    )

    # Enhanced filtering options
    list_filter = (
        'status', 
        'category',
        'condition',
        'is_approved', 
        'is_featured', 
        'created_at',
        'point_value'
    )

    # Improved search functionality
    search_fields = (
        'title', 
        'description',
        'tags',
        'brand',
        'color',
        'owner__username',
        'owner__email'
    )

    # Better organization of fields in detail view
    fieldsets = (
        ('Basic Information', {
            'fields': ('owner', 'title', 'description')
        }),
        ('Item Details', {
            'fields': ('category', 'size', 'condition', 'brand', 'color', 'tags')
        }),
        ('Exchange Settings', {
            'fields': ('status', 'point_value'),
            'description': 'Configure how this item can be exchanged'
        }),
        ('Engagement Metrics', {
            'fields': ('view_count', 'like_count'),
            'classes': ('collapse',),
            'description': 'Automatically tracked metrics'
        }),
        ('Admin Controls', {
            'fields': ('is_approved', 'is_featured', 'rejection_reason'),
            'classes': ('collapse',),
            'description': 'Administrative controls and moderation'
        }),
    )

    # Read-only fields that shouldn't be manually edited
    readonly_fields = ('view_count', 'like_count', 'created_at', 'updated_at')

    # Custom actions
    actions = ['approve_items', 'feature_items', 'unfeature_items']

    def approve_items(self, request, queryset):
        """Bulk approve selected items"""
        updated = queryset.update(is_approved=True, rejection_reason='')
        self.message_user(request, f'{updated} items were approved.')
    approve_items.short_description = "Approve selected items"

    def feature_items(self, request, queryset):
        """Bulk feature selected items"""
        updated = queryset.filter(is_approved=True).update(is_featured=True)
        self.message_user(request, f'{updated} items were featured.')
    feature_items.short_description = "Feature selected items"

    def unfeature_items(self, request, queryset):
        """Bulk unfeature selected items"""
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} items were unfeatured.')
    unfeature_items.short_description = "Remove featured status"

@admin.register(ItemLike)
class ItemLikeAdmin(ModelAdmin):
    list_display = ('user', 'item', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'item__title')
    readonly_fields = ('created_at',)
