from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    points = models.IntegerField(default=0)
    location = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)

    def __str__(self):
        return self.username

