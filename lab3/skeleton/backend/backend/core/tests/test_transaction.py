import json
from pprint import pprint
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase

from backend.core.models import (
    User,
    Listing,
    Category,
    ListingType,
    ListingRate,
    TimeUnit,
    Offer,
    Transaction,
)


class TransactionTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create test users
        self.owner = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="testpass123",
            phone_number="88888888",
        )
        self.renter = User.objects.create_user(
            username="renter",
            email="renter@example.com",
            password="testpass123",
            phone_number="99999999",
        )

        # Create a test listing
        self.listing = Listing.objects.create(
            title="Test Item",
            description="Test description",
            category=Category.ELECTRONICS,
            listing_type=ListingType.RENTAL,
            uploaded_by=self.owner,
        )

        # Add rate for the listing
        self.rate = ListingRate.objects.create(
            listing=self.listing,
            time_unit=TimeUnit.HOURLY,
            rate=10.00,
        )

        # Create an accepted offer
        self.offer = Offer.objects.create(
            offered_by=self.renter,
            listing=self.listing,
            price=10.00,
            scheduled_start=timezone.now(),
            scheduled_end=timezone.now() + timedelta(hours=2),
            time_unit=TimeUnit.HOURLY,
            time_delta=2,
            status=Offer.ACCEPTED,  # Set as accepted
        )

        # Create some test transactions
        self.transaction1 = Transaction.objects.create(
            user=self.renter,
            offer=self.offer,
            amount=20.00,  # 2 hours at $10/hour
            status=Transaction.COMPLETED,
            payment_id="TEST_PAYMENT_1",
        )

    def test_get_transactions(self):
        """Test retrieving transactions for a user"""
        # Test renter's perspective (should see their transaction)
        self.client.force_authenticate(user=self.renter)
        response = self.client.get("/transactions/", format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)

        # Verify transaction details
        transaction = data[0]
        self.assertEqual(float(transaction["amount"]), 20.00)
        self.assertEqual(transaction["status"], Transaction.COMPLETED)
        self.assertEqual(transaction["payment_id"], "TEST_PAYMENT_1")

        # Verify nested offer details
        self.assertEqual(float(transaction["offer"]["price"]), 10.00)
        self.assertEqual(transaction["offer"]["time_unit"], TimeUnit.HOURLY)

        # Verify nested user details
        self.assertEqual(transaction["user"]["username"], "renter")
        self.assertEqual(transaction["user"]["email"], "renter@example.com")

        # Test owner's perspective (should see no transactions)
        self.client.force_authenticate(user=self.owner)
        response = self.client.get("/transactions/", format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 0)

    def test_create_transaction(self):
        """Test creating a new transaction"""
        self.client.force_authenticate(user=self.renter)

        # Create another offer for testing
        new_offer = Offer.objects.create(
            offered_by=self.renter,
            listing=self.listing,
            price=15.00,
            scheduled_start=timezone.now() + timedelta(days=1),
            scheduled_end=timezone.now() + timedelta(days=1, hours=3),
            time_unit=TimeUnit.HOURLY,
            time_delta=3,
            status=Offer.ACCEPTED,
        )

        # Good case - valid transaction data
        data = {
            "offer_id": new_offer.id,
            "amount": 45.00,  # 3 hours at $15/hour
            "status": Transaction.COMPLETED,
            "payment_id": "TEST_PAYMENT_2",
        }

        response = self.client.post("/transactions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify created transaction
        created_transaction = response.data
        self.assertEqual(float(created_transaction["amount"]), 45.00)
        self.assertEqual(created_transaction["status"], Transaction.COMPLETED)
        self.assertEqual(created_transaction["payment_id"], "TEST_PAYMENT_2")

        # Verify the offer status is updated to paid
        new_offer.refresh_from_db()
        self.assertEqual(new_offer.status, Offer.PAID)

        # Bad case - missing required fields
        data = {
            "offer_id": new_offer.id,
            # missing amount
            "status": Transaction.COMPLETED,
        }
        response = self.client.post("/transactions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_transaction_with_different_status(self):
        """Test creating transactions with different status values"""
        self.client.force_authenticate(user=self.renter)

        # Create new offer for testing
        new_offer = Offer.objects.create(
            offered_by=self.renter,
            listing=self.listing,
            price=15.00,
            scheduled_start=timezone.now() + timedelta(days=2),
            scheduled_end=timezone.now() + timedelta(days=2, hours=2),
            time_unit=TimeUnit.HOURLY,
            time_delta=2,
            status=Offer.ACCEPTED,
        )

        # Test Pending status
        data = {
            "offer_id": new_offer.id,
            "amount": 30.00,
            "status": Transaction.PENDING,
            "payment_id": "PENDING_PAYMENT",
        }
        response = self.client.post("/transactions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Transaction.PENDING)

        # Test Failed status
        data.update({"status": Transaction.FAILED, "payment_id": "FAILED_PAYMENT"})
        response = self.client.post("/transactions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Transaction.FAILED)

        # Test invalid status
        data.update(
            {"status": "X", "payment_id": "INVALID_STATUS_PAYMENT"}  # Invalid status
        )
        response = self.client.post("/transactions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthorized_access(self):
        """Test unauthorized access to transactions"""
        # Unauthenticated GET request
        response = self.client.get("/transactions/", format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Unauthenticated POST request
        data = {
            "offer_id": self.offer.id,
            "amount": 20.00,
            "status": Transaction.COMPLETED,
            "payment_id": "TEST_PAYMENT",
        }
        response = self.client.post("/transactions/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
