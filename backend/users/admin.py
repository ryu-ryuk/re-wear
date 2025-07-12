from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin 
from .models import User


@admin.register(User)
class UserAdmin(ModelAdmin, BaseUserAdmin):
    model = User
    list_display = ("username", "email", "points", "location", "is_staff")

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Profile", {"fields": ("points", "location", "profile_picture")}),
    )

