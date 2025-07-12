from django.db import models
from django.conf import settings

class SwapRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        REJECTED = 'rejected', 'Rejected'
        COMPLETED = 'completed', 'Completed'

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='swap_requests_made')
    requested_item = models.ForeignKey('items.Item', on_delete=models.CASCADE, related_name='swap_requests_received')
    offered_item = models.ForeignKey('items.Item', on_delete=models.CASCADE, related_name='swap_requests_offered')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    message = models.TextField(blank=True, help_text="Optional message to the item owner")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['requester', 'requested_item', 'offered_item']
        
    def __str__(self):
        return f"{self.requester.username} wants {self.requested_item.title} for {self.offered_item.title}"
