from django.core.management.base import BaseCommand, CommandError
from backend.core.models import User


class Command(BaseCommand):
    help = "Drops all databases and seeds it"

    def handle(self, *args, **options):
        # Drop all shopblock users
        User.objects.all().delete()

        # Seed some example data
        user1 = User.objects.create(
            email="user1@gmail.com", username="user1", phone_number="90000001"
        )
        user2 = User.objects.create(
            email="user2@gmail.com", username="user2", phone_number="90000002"
        )
        user3 = User.objects.create(
            email="user3@gmail.com", username="user3", phone_number="90000003"
        )

        print("Seeded - Users")
