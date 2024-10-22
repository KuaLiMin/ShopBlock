import json
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from backend.core.models import User, Listing, Category, ListingType


class ListingTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            phone_number="88888888",
        )

        # Create a few listings
        Listing.objects.create(
            title="Laptop for rent",
            description="High-end laptop available for rent",
            category=Category.ELECTRONICS,
            listing_type=ListingType.RENTAL,
            uploaded_by=self.user,
        )
        Listing.objects.create(
            title="Gardening services",
            description="Professional gardening and landscaping",
            category=Category.SERVICES,
            listing_type=ListingType.SERVICE,
            uploaded_by=self.user,
        )

    def test_get_listings(self):
        url = "/listing/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Parse the JSON content
        data = json.loads(response.content)

        self.assertEqual(len(data), 2)

        titles = [listing["title"] for listing in data]
        self.assertIn("Laptop for rent", titles)
        self.assertIn("Gardening services", titles)

        categories = [listing["category"] for listing in data]
        self.assertIn(Category.ELECTRONICS, categories)
        self.assertIn(Category.SERVICES, categories)
