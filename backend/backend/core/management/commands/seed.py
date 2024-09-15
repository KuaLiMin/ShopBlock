from django.core.management.base import BaseCommand, CommandError
from backend.core.models import User, Listing, Category, ListingType
from django.contrib.auth.hashers import make_password


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
