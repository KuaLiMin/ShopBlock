import os
import requests
from urllib.parse import urlparse

from django.core.management.base import BaseCommand, CommandError
from django.core.files import File
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth.hashers import make_password

from backend.core.models import User, Listing, Category, ListingType, ListingPhoto


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
            category=Category.ELECTRONICS,
            listing_type=ListingType.RENTAL,
        )

        listing2 = Listing.objects.create(
            uploaded_by=user2,
            title="Camping Tent",
            description="Looking to rent out a camping tent as it is unused in the house",
            category=Category.OTHER,
            listing_type=ListingType.RENTAL,
        )

        listing3 = Listing.objects.create(
            uploaded_by=user3,
            title="Plumbing services",
            description="Plumbing services, available from 9am to 5pm anywhere in Singapore.",
            category=Category.HOUSEHOLD,
            listing_type=ListingType.SERVICE,
        )
        print("Successfully Seeded - Listings")

        # Sample cat image
        image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/A-Cat.jpg/2560px-A-Cat.jpg"
        response = requests.get(image_url)

        url_path = urlparse(image_url).path
        file_name = os.path.basename(url_path)

        image_content = ContentFile(response.content)
        image_file = SimpleUploadedFile(
            file_name,
            image_content.read(),
            content_type=response.headers.get("content-type"),
        )

        listing_photo = ListingPhoto(image=image_file, listing=listing1)
        listing_photo.save()

        print("Successfully Seeded - Listing Photos")
