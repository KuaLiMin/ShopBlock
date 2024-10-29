import json
from pprint import pprint
from decimal import Decimal
from datetime import datetime, timedelta
from django.utils import timezone
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from backend.core.models import (
    User,
    Listing,
    Category,
    ListingType,
    ListingRate,
    TimeUnit,
    Offer,
)


class OfferTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create test users
        self.owner = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="testpass123",
            phone_number="88888888",
        )
        self.renter1 = User.objects.create_user(
            username="renter1",
            email="renter1@example.com",
            password="testpass123",
            phone_number="99999999",
        )
        self.renter2 = User.objects.create_user(
            username="renter2",
            email="renter2@example.com",
            password="testpass123",
            phone_number="77777777",
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

        # Create some test offers
        self.offer1 = Offer.objects.create(
            offered_by=self.renter1,
            listing=self.listing,
            price=8.00,
            scheduled_start=timezone.now(),
            scheduled_end=timezone.now() + timedelta(hours=2),
            time_unit=TimeUnit.HOURLY,
            time_delta=2,
        )

        self.offer2 = Offer.objects.create(
            offered_by=self.renter2,
            listing=self.listing,
            price=12.00,
            scheduled_start=timezone.now() + timedelta(days=1),
            scheduled_end=timezone.now() + timedelta(days=1, hours=3),
            time_unit=TimeUnit.HOURLY,
            time_delta=3,
        )

    def test_get_offers_by_listing(self):
        """Test retrieving offers for a specific listing"""
        self.client.force_authenticate(user=self.owner)

        response = self.client.get(
            f"/offers/?listing_id={self.listing.id}", format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(len(data), 2)

        # Verify first offer details
        offer1_data = next(item for item in data if float(item["price"]) == 8.00)
        self.assertEqual(offer1_data["offered_by"]["username"], "renter1")
        self.assertEqual(offer1_data["status"], "P")  # Pending

        # Verify second offer details
        offer2_data = next(item for item in data if float(item["price"]) == 12.00)
        self.assertEqual(offer2_data["offered_by"]["username"], "renter2")
        self.assertEqual(offer2_data["status"], "P")  # Pending

    def test_get_offers_by_type(self):
        """Test retrieving offers by type (received/made)"""
        # Test received offers (owner's perspective)
        self.client.force_authenticate(user=self.owner)
        response = self.client.get("/offers/?type=received", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 2)  # Should see both offers

        # Test made offers (renter1's perspective)
        self.client.force_authenticate(user=self.renter1)
        response = self.client.get("/offers/?type=made", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)  # Should only see their own offer
        self.assertEqual(float(data[0]["price"]), 8.00)

    def test_create_offer(self):
        """Test creating a new offer"""
        self.client.force_authenticate(user=self.renter2)

        # Good case - valid offer data with no schedule collision
        data = {
            "listing_id": self.listing.id,
            "price": 15.00,
            "scheduled_start": (timezone.now() + timedelta(days=2)).isoformat(),
            "scheduled_end": (timezone.now() + timedelta(days=2, hours=2)).isoformat(),
            "time_unit": TimeUnit.HOURLY,
            "time_delta": 2,
        }

        response = self.client.post("/offers/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data["price"]), Decimal("15.00"))

        # Bad case - schedule collision
        data = {
            "listing_id": self.listing.id,
            "price": 20.00,
            "scheduled_start": self.offer1.scheduled_start.isoformat(),
            "scheduled_end": self.offer1.scheduled_end.isoformat(),
            "time_unit": TimeUnit.HOURLY,
            "time_delta": 2,
        }

        response = self.client.post("/offers/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Schedule collision", str(response.data["error"]))

        # Bad case - end time before start time
        data = {
            "listing_id": self.listing.id,
            "price": 20.00,
            "scheduled_start": timezone.now().isoformat(),
            "scheduled_end": (timezone.now() - timedelta(hours=1)).isoformat(),
            "time_unit": TimeUnit.HOURLY,
            "time_delta": 1,
        }

        response = self.client.post("/offers/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("End time must be after start time", str(response.data))

        # Bad case - non-existent listing
        data["listing_id"] = 99999
        response = self.client.post("/offers/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Listing does not exist", str(response.data))

    def test_update_offer_status(self):
        """Test accepting and rejecting offers"""
        self.client.force_authenticate(user=self.owner)

        # Good case - accept offer
        data = {"offer_id": self.offer1.id, "action": "accept"}
        response = self.client.put("/offers/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "A")  # Accepted

        # Good case - reject offer
        data = {"offer_id": self.offer2.id, "action": "reject"}
        response = self.client.put("/offers/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "R")  # Rejected

        # Bad case - unauthorized user trying to accept/reject
        self.client.force_authenticate(user=self.renter1)
        data = {"offer_id": self.offer2.id, "action": "accept"}
        response = self.client.put("/offers/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
