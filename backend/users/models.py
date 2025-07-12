from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

class User(AbstractUser):
    points = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    location = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(upload_to="profiles/", blank=True, null=True)
    is_private = models.BooleanField(default=False, help_text="Hide profile from public view")

    def __str__(self):
        return self.username

   

