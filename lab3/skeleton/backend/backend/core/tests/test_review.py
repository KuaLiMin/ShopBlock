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
    Review,
)


class ReviewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create test users
        self.user1 = User.objects.create_user(
            username="user1",
            email="user1@example.com",
            password="testpass123",
            phone_number="88888888",
        )
        self.user2 = User.objects.create_user(
            username="user2",
            email="user2@example.com",
            password="testpass123",
            phone_number="99999999",
        )
        self.user3 = User.objects.create_user(
            username="user3",
            email="user3@example.com",
            password="testpass123",
            phone_number="77777777",
        )

        # Create some test reviews
        self.review1 = Review.objects.create(
            reviewer=self.user2,
            user=self.user1,
            rating=5,
            description="Excellent user to work with!",
        )

        self.review2 = Review.objects.create(
            reviewer=self.user3,
            user=self.user1,
            rating=4,
            description="Very good experience",
        )

        self.review3 = Review.objects.create(
            reviewer=self.user1,
            user=self.user2,
            rating=5,
            description="Great transaction",
        )

    def test_get_reviews_by_user(self):
        """Test retrieving reviews for a specific user"""
        self.client.force_authenticate(user=self.user1)

        # Get reviews for user1 (should have 2 reviews)
        response = self.client.get(f"/reviews/?user_id={self.user1.id}", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(len(data), 2)

        # Verify review details
        reviews = sorted(data, key=lambda x: x["rating"], reverse=True)

        # Check first review (rating 5)
        self.assertEqual(reviews[0]["rating"], 5)
        self.assertEqual(reviews[0]["description"], "Excellent user to work with!")
        self.assertEqual(reviews[0]["reviewer"]["username"], "user2")
        self.assertEqual(reviews[0]["user"]["username"], "user1")

        # Check second review (rating 4)
        self.assertEqual(reviews[1]["rating"], 4)
        self.assertEqual(reviews[1]["description"], "Very good experience")
        self.assertEqual(reviews[1]["reviewer"]["username"], "user3")
        self.assertEqual(reviews[1]["user"]["username"], "user1")

        # Get reviews for user2 (should have 1 review)
        response = self.client.get(f"/reviews/?user_id={self.user2.id}", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(len(data), 1)

        # Verify the single review
        review = data[0]
        self.assertEqual(review["rating"], 5)
        self.assertEqual(review["description"], "Great transaction")
        self.assertEqual(review["reviewer"]["username"], "user1")
        self.assertEqual(review["user"]["username"], "user2")

        # Get reviews for user3 (should have 0 reviews)
        response = self.client.get(f"/reviews/?user_id={self.user3.id}", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(len(data), 0)

    def test_get_own_reviews(self):
        """Test retrieving reviews without user_id parameter (should get authenticated user's reviews)"""
        self.client.force_authenticate(user=self.user1)

        response = self.client.get("/reviews/", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(len(data), 2)  # user1 has 2 reviews

        # Verify these are the reviews for user1
        usernames = {review["reviewer"]["username"] for review in data}
        self.assertEqual(usernames, {"user2", "user3"})

    def test_create_review(self):
        """Test creating a new review"""
        self.client.force_authenticate(user=self.user2)

        # Good case - valid review data
        data = {
            "user_id": self.user3.id,  # Reviewing user3
            "rating": 4,
            "description": "Good communication and reliable",
        }

        response = self.client.post("/reviews/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify created review
        created_review = response.json()
        self.assertEqual(created_review["rating"], 4)
        self.assertEqual(
            created_review["description"], "Good communication and reliable"
        )
        self.assertEqual(created_review["reviewer"]["username"], "user2")
        self.assertEqual(created_review["user"]["username"], "user3")

        # Bad case - try to review yourself
        data["user_id"] = self.user2.id
        response = self.client.post("/reviews/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cannot review yourself", str(response.data["error"]).lower())

        # Bad case - invalid rating
        data["user_id"] = self.user3.id
        data["rating"] = 6  # Ratings should only be 1-5
        response = self.client.post("/reviews/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Bad case - missing required fields
        data = {
            "user_id": self.user3.id,
            # missing rating
            "description": "Incomplete review",
        }
        response = self.client.post("/reviews/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_access(self):
        """Test review access without authentication"""
        # Should still be able to view reviews without authentication when user_id is provided
        response = self.client.get(f"/reviews/?user_id={self.user1.id}", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 2)

        # Cannot create review without authentication
        data = {
            "user_id": self.user1.id,
            "rating": 4,
            "description": "Unauthorized review",
        }
        response = self.client.post("/reviews/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_review_statistics(self):
        """Test that review statistics are correctly calculated"""
        # Get user1's reviews and verify average rating
        response = self.client.get(f"/reviews/?user_id={self.user1.id}", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        # Calculate average rating manually
        ratings = [review["rating"] for review in data]
        expected_average = sum(ratings) / len(ratings)

        # Get user1's profile to check average_rating
        self.client.force_authenticate(user=self.user1)
        profile_response = self.client.get("/user/", format="json")
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)

        # Verify the average rating in the profile matches our calculation
        self.assertAlmostEqual(
            float(profile_response.data["average_rating"]), expected_average
        )
