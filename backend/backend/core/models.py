from django.db import models


# Create your models here.
class User(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    # phone number is local context (8 digits) and is optional
    phone_number = models.CharField(max_length=8, blank=True, null=True)
