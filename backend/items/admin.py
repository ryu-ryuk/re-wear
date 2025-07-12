from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from .models import Item, ItemImage

class ItemImageInline(TabularInline):
    model = ItemImage
    extra = 1  # allows uploading one image at a time

@admin.register(Item)
class ItemAdmin(ModelAdmin):
    inlines = [ItemImageInline]

    # fields to display in the main list view
    list_display = (
        'title', 
        'owner', 
        'status', 
        'condition', 
        'is_approved', 
        'is_featured'
    )

    # fields that can be edited directly from the list view
    list_editable = (
        'status', 
        'is_approved', 
        'is_featured'
    )

    # filters for the sidebar
    list_filter = (
        'status', 
        'is_approved', 
        'is_featured', 
        'condition', 
        'category'
    )

    # search functionality
    search_fields = (
        'title', 
        'owner__email', 
        'description'
    )

    # organizes the fields in the item detail/edit page
    fieldsets = (
        (None, {
            'fields': ('owner', 'title', 'description')
        }),
        ('Details', {
            'fields': ('category', 'size', 'condition', 'status')
        }),
        ('Admin', {
            'fields': ('is_approved', 'is_featured'),
            'classes': ('collapse',) # make this section collapsible
        }),
    )
