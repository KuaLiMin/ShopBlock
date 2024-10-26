from django.core.management.base import BaseCommand
from backend.core.models import (
    Offer,
    Review,
    Transaction,
)


class Command(BaseCommand):
    help = "Drops all reviews, orders and transactions tables in order"

    def handle(self, *args, **options):
        # Drop all reviews
        Review.objects.all().delete()
        print("Dropped all reviews")

        # Drop all offers
        Offer.objects.all().delete()
        print("Dropped all offers")

        # Drop all transaction
        Transaction.objects.all().delete()
        print("Dropped all transactions")
