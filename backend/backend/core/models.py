from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import (
    BaseUserManager,
    AbstractBaseUser,
    PermissionsMixin,
)
from django.core.validators import MinValueValidator
from django.contrib.auth.hashers import make_password


# The different category types
class Category(models.TextChoices):
    ELECTRONICS = "EL", _("Electronics")
    SUPPLIES = "SU", _("Supplies")
    SERVICES = "SE", _("Services")


# Type of listings
class ListingType(models.TextChoices):
    RENTAL = "RE", _("Rental")
    SERVICE = "SE", _("Service")


# Types of time units
class TimeUnit(models.TextChoices):
    ONETIME = "OT", _("OneTime")
    HOURLY = "H", _("Hourly")
    DAILY = "D", _("Daily")
    WEEKLY = "W", _("Weekly")


# Create your models here.
class UserManager(BaseUserManager):
    # Do some validation here before creating a new user
    # if validation goes through, then create the new user
    def create_user(self, email, username, password=None, avatar=None):
        if not email:
            raise ValueError("Users must have an email")

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, avatar=avatar)

        user.set_password(password)
        user.save(using=self._db)

        return user


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=255, unique=True)
    avatar = models.ImageField(upload_to="avatars/", null=True)

    objects = UserManager()

    # Setting this allows the user to log in by email instead of username
    USERNAME_FIELD = "email"
    # But the user must also set a username
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


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
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    image_url = models.ImageField(upload_to="listings/")

    def __str__(self):
        return f"Photo for {self.listing.title}"


# This is a separate table that stores the rates per listing
class ListingRate(models.Model):
    listing = models.ForeignKey(
        "Listing", on_delete=models.CASCADE, related_name="rates"
    )
    time_unit = models.CharField(max_length=2, choices=TimeUnit.choices)
    rate = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )

    class Meta:
        unique_together = ["listing", "time_unit"]

    def __str__(self):
        return (
            f"{self.listing.title} - {self.get_time_unit_display()} Rate: {self.rate}"
        )


class ListingLocation(models.Model):
    listing = models.ForeignKey(
        "Listing", on_delete=models.CASCADE, related_name="locations"
    )
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    query = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Location (Lat: {self.latitude}, Long: {self.longitude})"


class Offer(models.Model):
    # The only available statuses for an offer
    PENDING = "P"
    ACCEPTED = "A"
    REJECTED = "R"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (ACCEPTED, "Accepted"),
        (REJECTED, "Rejected"),
    ]

    # The user making the offer
    offered_by = models.ForeignKey(
        User, related_name="offers_made", on_delete=models.CASCADE
    )

    # Link back to the listing
    listing = models.ForeignKey(
        Listing, related_name="offers_received", on_delete=models.CASCADE
    )

    # The price offered by the user, this isn't fixed by the listing
    # since the user making offer can offer certain amounts
    price = models.DecimalField(max_digits=10, decimal_places=2)

    # Status of the offer
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default=PENDING)

    # Timestamp when the offer is made
    created_at = models.DateTimeField(auto_now_add=True)

    # for the original listing owner to accept
    def accept(self):
        if self.status == self.PENDING:
            self.status = self.ACCEPTED
            self.save()

    # for the original listing owner to reject
    def reject(self):
        if self.status == self.PENDING:
            self.status = self.REJECTED
            self.save()


class Review(models.Model):
    reviewer = models.ForeignKey(
        User, related_name="reviews_given", on_delete=models.CASCADE
    )
    # Reference to the user being reviewed
    user = models.ForeignKey(
        User,
        related_name="reviews_received",
        on_delete=models.CASCADE,
    )
    rating = models.PositiveSmallIntegerField()
    # Optional description for the review
    description = models.TextField(blank=True, null=True)
    # Automatically set the time when the review was created
    created_at = models.DateTimeField(auto_now_add=True)


class Transaction(models.Model):
    PENDING = "P"
    COMPLETED = "C"
    FAILED = "F"
    REFUNDED = "R"

    TRANSACTION_STATUS_CHOICES = [
        (PENDING, "Pending"),
        (COMPLETED, "Completed"),
        (FAILED, "Failed"),
        (REFUNDED, "Refunded"),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="transaction"
    )
    offer = models.OneToOneField(
        Offer, on_delete=models.CASCADE, related_name="transaction"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=1, choices=TRANSACTION_STATUS_CHOICES, default=PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def complete(self):
        if self.status == self.PENDING:
            self.status = self.COMPLETED
            self.save()

    def fail(self):
        if self.status == self.PENDING:
            self.status = self.FAILED
            self.save()

    def refund(self):
        if self.status == self.COMPLETED:
            self.status = self.REFUNDED
            self.save()

    def __str__(self):
        return f"Transaction {self.id} - {self.get_status_display()} - {self.amount}"
