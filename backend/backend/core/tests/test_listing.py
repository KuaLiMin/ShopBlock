from decimal import Decimal
import json
from pprint import pprint
from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile

from backend.core.models import (
    User,
    Listing,
    Category,
    ListingType,
    ListingRate,
    ListingLocation,
    TimeUnit,
)

from backend.core.tests.utils import get_test_photo, get_blank_photo


class ListingTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create test users
        self.user1 = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            phone_number="88888888",
        )
        self.user2 = User.objects.create_user(
            username="testuser2",
            email="test2@example.com",
            password="testpass123",
            phone_number="99999999",
        )

        # Create listings with locations and rates
        self.listing1 = Listing.objects.create(
            title="Electronic Drill",
            description="Professional electronic drill for rent",
            category=Category.ELECTRONICS,
            listing_type=ListingType.RENTAL,
            uploaded_by=self.user1,
        )

        # listing 1 rates
        ListingRate.objects.create(
            listing=self.listing1,
            time_unit=TimeUnit.HOURLY,
            rate=10.00,
        )

        # listing 1 location
        ListingLocation.objects.create(
            listing=self.listing1,
            latitude=1.31745,  # Farrer Road
            longitude=103.80704,
            query="Farrer Road",
            notes="Available for pickup",
        )

        # listing 2
        self.listing2 = Listing.objects.create(
            title="Plumbing Service",
            description="Professional plumbing services",
            category=Category.SERVICES,
            listing_type=ListingType.SERVICE,
            uploaded_by=self.user2,
        )

        # listing 2 rates
        ListingRate.objects.create(
            listing=self.listing2,
            time_unit=TimeUnit.ONETIME,
            rate=70.00,
        )

        # listing 2 location
        ListingLocation.objects.create(
            listing=self.listing2,
            latitude=1.42953,  # Yishun
            longitude=103.83503,
            query="Yishun",
            notes="Service available in this area",
        )

    def test_get_all_listings(self):
        """Test retrieving all listings"""
        response = self.client.get("/listing/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)

        # Check that there is 2
        self.assertEqual(len(data), 2)

        # Check the order,
        # It's in reverse order of creation, so the latest created will come first
        self.assertEqual(data[0]["title"], "Plumbing Service")
        self.assertEqual(data[1]["title"], "Electronic Drill")

        listing1_data = next(
            item for item in data if item["title"] == "Electronic Drill"
        )
        self.assertEqual(
            listing1_data["description"], "Professional electronic drill for rent"
        )
        self.assertEqual(listing1_data["category"], Category.ELECTRONICS)
        self.assertEqual(listing1_data["listing_type"], ListingType.RENTAL)
        self.assertEqual(listing1_data["uploaded_by"], self.user1.id)

        # Verify listing 1's rate
        self.assertEqual(len(listing1_data["rates"]), 1)
        rate1 = listing1_data["rates"][0]
        self.assertEqual(rate1["time_unit"], TimeUnit.HOURLY)
        self.assertEqual(float(rate1["rate"]), 10.00)

        # Verify listing 1's location
        self.assertEqual(len(listing1_data["locations"]), 1)
        location1 = listing1_data["locations"][0]
        self.assertEqual(float(location1["latitude"]), 1.31745)
        self.assertEqual(float(location1["longitude"]), 103.80704)
        self.assertEqual(location1["query"], "Farrer Road")
        self.assertEqual(location1["notes"], "Available for pickup")

        # Get the plumbing service listing
        listing2_data = next(
            item for item in data if item["title"] == "Plumbing Service"
        )
        self.assertEqual(listing2_data["description"], "Professional plumbing services")
        self.assertEqual(listing2_data["category"], Category.SERVICES)
        self.assertEqual(listing2_data["listing_type"], ListingType.SERVICE)
        self.assertEqual(listing2_data["uploaded_by"], self.user2.id)

        # Verify listing 2's rate
        self.assertEqual(len(listing2_data["rates"]), 1)
        rate2 = listing2_data["rates"][0]
        self.assertEqual(rate2["time_unit"], TimeUnit.ONETIME)
        self.assertEqual(float(rate2["rate"]), 70.00)

        # Verify listing 2's location
        self.assertEqual(len(listing2_data["locations"]), 1)
        location2 = listing2_data["locations"][0]
        self.assertEqual(float(location2["latitude"]), 1.42953)
        self.assertEqual(float(location2["longitude"]), 103.83503)
        self.assertEqual(location2["query"], "Yishun")
        self.assertEqual(location2["notes"], "Service available in this area")

        # Check the presence of the timestamps
        for listing_data in data:
            self.assertIn("created_at", listing_data)
            self.assertIn("updated_at", listing_data)

    def test_get_single_listing(self):
        """Test retrieving a single listing"""
        # Good case - existing listing
        response = self.client.get(f"/listing/?id={self.listing1.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)

        # Verify basic listing fields
        self.assertEqual(data["id"], self.listing1.id)
        self.assertEqual(data["title"], "Electronic Drill")
        self.assertEqual(data["description"], "Professional electronic drill for rent")
        self.assertEqual(data["category"], Category.ELECTRONICS)
        self.assertEqual(data["listing_type"], ListingType.RENTAL)
        self.assertEqual(data["uploaded_by"], self.user1.id)

        # Verify timestamps exist and are properly formatted
        self.assertIsNotNone(data["created_at"])
        self.assertIsNotNone(data["updated_at"])

        # Verify rates
        self.assertEqual(len(data["rates"]), 1)
        rate = data["rates"][0]
        self.assertEqual(rate["time_unit"], TimeUnit.HOURLY)
        self.assertEqual(Decimal(str(rate["rate"])), Decimal("10.00"))

        # Verify locations
        self.assertEqual(len(data["locations"]), 1)
        location = data["locations"][0]
        self.assertEqual(float(location["latitude"]), 1.31745)
        self.assertEqual(float(location["longitude"]), 103.80704)
        self.assertEqual(location["query"], "Farrer Road")
        self.assertEqual(location["notes"], "Available for pickup")

        # Bad case - non-existent listing
        response = self.client.get("/listing/?id=999")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(json.loads(response.content)["error"], "Listing not found")

    def test_create_listing(self):
        """Test creating a new listing"""
        self.client.force_authenticate(user=self.user1)

        # Good case - valid listing data
        data = {
            "title": "New Test Listing",
            "description": "Test description",
            "category": Category.SUPPLIES,
            "listing_type": ListingType.RENTAL,
            "photos": [get_blank_photo()],
            "rates": '[{"time_unit": "D", "rate": "25.00"}]',
            "locations": '[{"latitude": 1.35160, "longitude": 103.87119, "query": "Nex", "notes": "Test location"}]',
            "uploaded_by": self.user1.id,
        }

        response = self.client.post("/listing/", data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(json.loads(response.content)["title"], "New Test Listing")

        # Bad case - missing required fields
        bad_data = {
            "title": "Incomplete Listing",
            # missing other required fields
        }
        response = self.client.post("/listing/", bad_data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_listing(self):
        """Test updating an existing listing"""
        self.client.force_authenticate(user=self.user1)

        # Good case - valid update data
        update_data = {
            "id": self.listing1.id,
            "title": "Updated Drill",
            "description": "Updated description",
            "category": Category.ELECTRONICS,
            "listing_type": ListingType.RENTAL,
            "rates": '[{"time_unit": "OT", "rate": "15.00"}]',
            "locations": '[{"latitude": 1.35160, "longitude": 103.87119, "query": "Nex", "notes": "Test location"}]',
            "uploaded_by": self.user1.id,
        }

        response = self.client.put("/listing/", update_data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)["title"], "Updated Drill")
        self.assertEqual(
            json.loads(response.content)["description"], "Updated description"
        )

        # Bad case - trying to update another user's listing
        self.client.force_authenticate(user=self.user2)
        response = self.client.put("/listing/", update_data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            json.loads(response.content)["error"],
            "You don't have permission to update this listing",
        )

    def test_delete_listing(self):
        """Test deleting a listing"""
        self.client.force_authenticate(user=self.user1)

        # Good case - deleting own listing
        response = self.client.delete(f"/listing/?id={self.listing1.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Bad case - trying to delete another user's listing
        response = self.client.delete(f"/listing/?id={self.listing2.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            json.loads(response.content)["error"],
            "You don't have permission to delete this listing",
        )

        # Bad case - trying to delete non-existent listing
        response = self.client.delete("/listing/?id=999")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(json.loads(response.content)["error"], "Listing not found")

    def test_search_listings(self):
        """Test searching listings"""
        # Search by title
        response = self.client.get("/listing/?search=Drill")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Electronic Drill")

        # Search by category
        response = self.client.get(f"/listing/?category={Category.SERVICES}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Plumbing Service")

        # Search by listing type
        response = self.client.get(f"/listing/?listing_type={ListingType.RENTAL}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Electronic Drill")

    def test_price_sorting(self):
        """Test sorting listings by price"""
        # Test price sorting with time unit
        response = self.client.get(
            f"/listing/?time_unit={TimeUnit.HOURLY}&sort_by=price_asc"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Bad case - sorting by price without time unit
        response = self.client.get("/listing/?sort_by=price_asc")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content)["error"],
            "Time unit must be specified when sorting by price",
        )
