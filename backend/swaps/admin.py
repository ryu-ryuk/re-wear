from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import SwapRequest

@admin.register(SwapRequest)
class SwapRequestAdmin(ModelAdmin):
    list_display = ('requester', 'requested_item', 'offered_item', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('requester__username', 'requested_item__title', 'offered_item__title')
    list_editable = ('status',)
    
    fieldsets = (
        (None, {
            'fields': ('requester', 'requested_item', 'offered_item', 'message')
        }),
        ('Status', {
            'fields': ('status',)
        }),
    )
