from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

class User(AbstractUser):
    email = models.EmailField(unique=True)
    points = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    location = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)
    is_private = models.BooleanField(default=False, help_text="Hide profile from public view")

    def __str__(self):
        return self.username

    def can_redeem_item(self, item):
        """Check if user can redeem a specific item"""
        return (
            self.points >= item.point_value and 
            item.owner != self and
            item.status == 'available' and
            item.is_approved
        )
    
    def deduct_points(self, amount):
        """Safely deduct points from user account"""
        if self.points >= amount:
            self.points -= amount
            self.save()
            return True
        return False
    
    def add_points(self, amount):
        """Add points to user account"""
        self.points += amount
        self.save()
        return self.points

