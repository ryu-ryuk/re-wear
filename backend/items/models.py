from django.conf import settings
from django.db import models

class Item(models.Model):
    # defining choices for fields
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        PENDING = 'pending', 'Pending'
        SWAPPED = 'swapped', 'Swapped'

    class Condition(models.TextChoices):
        NEW = 'new', 'New (with tags)'
        EXCELLENT = 'excellent', 'Excellent'
        GOOD = 'good', 'Good'
        FAIR = 'fair', 'Fair'

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100) # e.g., 'tops', 'bottoms', 'dresses'
    size = models.CharField(max_length=50) # e.g., 's', 'm', 'l', '32'
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.GOOD)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    
    # admin-related fields
    is_approved = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='items/')

    def __str__(self):
        return f"Image for {self.item.title}"

