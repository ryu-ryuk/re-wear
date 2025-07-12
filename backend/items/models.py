from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.text import slugify

class PlatformConfig(models.Model):
    """
    🔧 Platform Configuration - Admin configurable settings
    
    Singleton model to store platform-wide settings that admins can modify.
    """
    featured_items_count = models.PositiveIntegerField(
        default=6,
        validators=[MinValueValidator(1), MaxValueValidator(20)],
        help_text="Default number of featured items to show (1-20)"
    )
    
    # Future admin settings can be added here
    # max_swap_requests_per_day = models.PositiveIntegerField(default=10)
    # welcome_bonus_points = models.PositiveIntegerField(default=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Platform Configuration"
        verbose_name_plural = "Platform Configuration"
    
    def __str__(self):
        return f"Platform Config (Featured: {self.featured_items_count})"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists (singleton pattern)
        if not self.pk and PlatformConfig.objects.exists():
            raise ValueError("Only one Platform Configuration instance is allowed")
        super().save(*args, **kwargs)
    
    @classmethod
    def get_config(cls):
        """Get or create the singleton configuration instance"""
        config, created = cls.objects.get_or_create(pk=1)
        return config

class Item(models.Model):
    # defining choices for fields - frontend friendly
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Available'
        PENDING = 'pending', 'Pending'  # when in a swap negotiation
        SWAPPED = 'swapped', 'Swapped'  # successfully exchanged
        RESERVED = 'reserved', 'Reserved'  # temporarily held

    class Condition(models.TextChoices):
        NEW = 'new', 'New (with tags)'
        EXCELLENT = 'excellent', 'Excellent'
        GOOD = 'good', 'Good'
        FAIR = 'fair', 'Fair'

    class Category(models.TextChoices):
        TOPS = 'tops', 'Tops'
        BOTTOMS = 'bottoms', 'Bottoms'
        DRESSES = 'dresses', 'Dresses'
        OUTERWEAR = 'outerwear', 'Outerwear'
        SHOES = 'shoes', 'Shoes'
        ACCESSORIES = 'accessories', 'Accessories'
        BAGS = 'bags', 'Bags'
        ACTIVEWEAR = 'activewear', 'Activewear'
        UNDERWEAR = 'underwear', 'Underwear'
        OTHER = 'other', 'Other'

    # Basic fields
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='items')
    title = models.CharField(max_length=255, help_text="Give your item a catchy title")
    description = models.TextField(help_text="Describe the item, its story, why you're sharing it")
    
    # Categorization
    category = models.CharField(max_length=20, choices=Category.choices)
    size = models.CharField(max_length=50, help_text="e.g., S, M, L, XL, 32, 8, etc.")
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.GOOD)
    
    # Exchange info
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    point_value = models.PositiveIntegerField(
        default=10, 
        validators=[MinValueValidator(1), MaxValueValidator(100)],
        help_text="Points required to redeem this item (1-100)"
    )
    
    # Metadata for better UX
    tags = models.CharField(
        max_length=500, 
        blank=True, 
        help_text="Comma-separated tags (e.g., vintage, summer, casual, designer)"
    )
    color = models.CharField(max_length=50, blank=True, help_text="Primary color of the item")
    brand = models.CharField(max_length=100, blank=True, help_text="Brand name (optional)")
    
    # Engagement metrics
    view_count = models.PositiveIntegerField(default=0, help_text="Number of times viewed")
    like_count = models.PositiveIntegerField(default=0, help_text="Number of likes/favorites")
    
    # Admin fields
    is_approved = models.BooleanField(default=True, help_text="Auto-approved, can be flagged for review")
    is_rejected = models.BooleanField(default=False, help_text="Explicitly rejected by admin")
    is_featured = models.BooleanField(default=False)
    is_flagged = models.BooleanField(default=False, help_text="Flagged for admin review")
    rejection_reason = models.TextField(blank=True, help_text="Admin reason for rejection")
    
    # Admin tracking fields
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True, 
        related_name='approved_items',
        help_text="Admin who approved this item"
    )
    rejected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True, 
        related_name='rejected_items',
        help_text="Admin who rejected this item"
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    featured_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'status']),
            models.Index(fields=['is_approved', 'is_featured']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.title} by {self.owner.username}"

    def get_tags_list(self):
        """Return tags as a list for frontend"""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return []

    def increment_view_count(self):
        """Thread-safe view count increment"""
        self.view_count = models.F('view_count') + 1
        self.save(update_fields=['view_count'])

class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='items/%Y/%m/')
    alt_text = models.CharField(max_length=255, blank=True, help_text="Accessibility description")
    is_primary = models.BooleanField(default=False, help_text="Main display image")
    order = models.PositiveIntegerField(default=0, help_text="Display order")

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image for {self.item.title}"

class ItemLike(models.Model):
    """Track user likes/favorites for better recommendations"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'item']

class ItemReport(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="reports")
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reason = models.TextField(help_text="Why is this item not good?")
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_reports"
    )

    class Meta:
        unique_together = ['item', 'reported_by']  # Prevent duplicate reports

    def __str__(self):
        return f"Report by {self.reported_by.username} on {self.item.title}"


