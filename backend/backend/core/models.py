from django.db import models
from django.utils.translation import gettext_lazy as _


# The different category types
class Category(models.TextChoices):
    ELECTRONICS = "EL", _("Electronics")
    FURNITURE = "FU", _("Furniture")
    CLOTHING = "CL", _("Clothing")
    BOOKS = "BO", _("Books")
    OTHER = "OT", _("Other")


# Type of listings
class ListingType(models.TextChoices):
    RENTAL = "RE", _("Rental")
    SERVICE = "SE", _("Service")


# Create your models here.
class User(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    # phone number is local context (8 digits) and is optional
    phone_number = models.CharField(max_length=8, blank=True, null=True)


class Listing(models.Model):
    # If user is deleted, then delete all their listings as well
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    # These categories can be filtered, default is electronics
    category = models.CharField(
        max_length=2, choices=Category.choices, default=Category.ELECTRONICS
    )
    # These are the types of listing, rental / services, default is rental
    listing_type = models.CharField(
        max_length=2, choices=ListingType.choices, default=ListingType.RENTAL
    )


class ListingPhoto(models.Model):
    image = models.ImageField(upload_to="listing_photos/")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)

    def __str__(self):
        return f"Photo for {self.listing.title}"
