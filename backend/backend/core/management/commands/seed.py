import os
import requests
from urllib.parse import urlparse

from django.core.management.base import BaseCommand, CommandError
from django.core.files import File
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.hashers import make_password

from backend.core.models import (
    User,
    Listing,
    Category,
    ListingType,
    ListingPhoto,
    Offer,
    Review,
)


class Command(BaseCommand):
    help = "Drops all databases and seeds it"

    def handle(self, *args, **options):
        # Drop all shopblock users
        User.objects.all().delete()

        # Seed some example data
        user1 = User.objects.create(
            email="user1@gmail.com",
            username="user1",
            password=make_password("password"),
        )
        user2 = User.objects.create(
            email="user2@gmail.com",
            username="user2",
            password=make_password("password"),
        )
        user3 = User.objects.create(
            email="user3@gmail.com",
            username="user3",
            password=make_password("password"),
        )
        print("Successfully Seeded - Users")

        # Seed some listing data
        listing1 = Listing.objects.create(
            uploaded_by=user1,
            title="Electronic Drill",
            description="Looking to rent out an electronic drill as I do not need it anymore",
            latitude=1.31745,  # somewhere in farrer road
            longitude=103.80704,
            category=Category.ELECTRONICS,
            listing_type=ListingType.RENTAL,
        )

        listing2 = Listing.objects.create(
            uploaded_by=user2,
            title="Camping Tent",
            description="Looking to rent out a camping tent as it is unused in the house",
            latitude=1.35160,  # somewhere in nex
            longitude=103.87119,
            category=Category.SUPPLIES,
            listing_type=ListingType.RENTAL,
        )

        listing3 = Listing.objects.create(
            uploaded_by=user3,
            title="Plumbing services",
            description="Plumbing services, available from 9am to 5pm anywhere in Singapore.",
            latitude=1.42953,  # somewhere in yishun
            longitude=103.83503,
            category=Category.SERVICES,
            listing_type=ListingType.SERVICE,
        )
        print("Successfully Seeded - Listings")

        # Seed a listing photo - sample cat image
        image_url = "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg"
        response = requests.get(image_url)

        url_path = urlparse(image_url).path
        file_name = os.path.basename(url_path)

        image_content = ContentFile(response.content)
        image_file = SimpleUploadedFile(
            file_name,
            image_content.read(),
            content_type=response.headers.get("content-type"),
        )

        listing_photo = ListingPhoto(image_url=image_file, listing=listing1)
        listing_photo.save()

        print("Successfully Seeded - Listing Photos")

        # Seed offers
        # User 2 makes an offer to User 1, for listing 1, but accepted
        offer1 = Offer.objects.create(offered_by=user2, listing=listing1, price=10.0)
        # Simulate an accept
        offer1.accept()

        print("Seeded offer 1 - User 2 to Listing 1 - Accepted")

        # User 3 makes an offer to User 2, for listing 2, but pending
        offer2 = Offer.objects.create(offered_by=user3, listing=listing2, price=50.0)

        print("Seeded offer 2 - User 3 to Listing 2 - Pending")

        # Since User 1 accepted an offer from User 2, User 2 reviews User 1
        review1 = Review.objects.create(
            reviewer=user2, user=user1, rating=5, description="Amazing seller"
        )

        print("Seeded review 1 - User 2 to User 1")
