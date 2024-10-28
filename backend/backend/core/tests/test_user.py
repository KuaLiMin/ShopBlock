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


class UserTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test avatar image
        self.test_avatar = get_blank_photo()

        # Create an existing user for duplicate testing
        self.existing_user = User.objects.create_user(
            username="existinguser",
            email="existing@example.com",
            password="existing123",
            phone_number="11111111",
        )

    def test_register_user(self):
        """Test user registration functionality"""
        # Good case - valid registration
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123",
            "phone_number": "88888888",
            "avatar": self.test_avatar,
            "biography": "Test biography",
        }

        response = self.client.post("/user/", data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify response data
        response_data = json.loads(response.content)
        self.assertEqual(response_data["username"], "testuser")
        self.assertEqual(response_data["email"], "test@example.com")
        self.assertEqual(response_data["phone_number"], "88888888")
        self.assertEqual(response_data["biography"], "Test biography")
        self.assertIn("avatar", response_data)
        self.assertNotIn(
            "password", response_data
        )  # Password should not be in response

        # Bad case - duplicate email
        duplicate_email_data = {
            "username": "newuser",
            "email": "existing@example.com",  # Using existing email
            "password": "newpass123",
            "phone_number": "99999999",
        }
        response = self.client.post("/user/", duplicate_email_data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content)["error"], "Email already registered"
        )

        # Bad case - missing required fields
        incomplete_data = {
            "username": "incomplete",
            # missing email and password
            "phone_number": "77777777",
        }
        response = self.client.post("/user/", incomplete_data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login(self):
        """Test user login functionality after registration"""
        # First register a new user
        register_data = {
            "username": "logintest",
            "email": "login@example.com",
            "password": "loginpass123",
            "phone_number": "88888888",
            "biography": "",
        }
        register_response = self.client.post(
            "/user/", register_data, format="multipart"
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        # Good case - correct credentials
        login_data = {"email": "login@example.com", "password": "loginpass123"}
        response = self.client.post("/api/login/", login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)  # Should receive JWT token
        self.assertIn("refresh", response.data)

        # Bad case - wrong password
        wrong_password_data = {"email": "login@example.com", "password": "wrongpass"}
        response = self.client.post("/api/login/", wrong_password_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Bad case - non-existent user
        nonexistent_data = {"email": "nonexistent@example.com", "password": "somepass"}
        response = self.client.post("/api/login/", nonexistent_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_profile(self):
        """Test retrieving user profile"""
        # Create and authenticate a user
        user = User.objects.create_user(
            username="profiletest",
            email="profile@example.com",
            password="profile123",
            phone_number="22222222",
            biography="Test bio",
        )
        self.client.force_authenticate(user=user)

        # Good case - authenticated user getting own profile
        response = self.client.get("/user/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify response data
        data = json.loads(response.content)
        self.assertEqual(data["username"], "profiletest")
        self.assertEqual(data["email"], "profile@example.com")
        self.assertEqual(data["phone_number"], "22222222")
        self.assertEqual(data["biography"], "Test bio")
        self.assertIn("average_rating", data)

        # Bad case - unauthenticated request without id
        self.client.force_authenticate(user=None)
        response = self.client.get("/user/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Good case - unauthenticated request with valid id
        response = self.client.get(f"/user/?id={user.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)["username"], "profiletest")

        # Bad case - non-existent user id
        response = self.client.get("/user/?id=999")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_user_profile(self):
        """Test updating user profile"""
        # Create and authenticate a user
        user = User.objects.create_user(
            username="updatetest",
            email="update@example.com",
            password="update123",
            phone_number="33333333",
        )
        self.client.force_authenticate(user=user)

        # Good case - update profile with new avatar
        new_avatar = get_test_photo()

        update_data = {
            "username": "updateduser",
            "phone_number": "44444444",
            "avatar": new_avatar,
            "biography": "Updated bio",
            "password": "update123",  # Current password
            "new_password": "newpass123",
        }

        response = self.client.put("/user/", update_data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify updated data
        data = json.loads(response.content)
        self.assertEqual(data["username"], "updateduser")
        self.assertEqual(data["phone_number"], "44444444")
        self.assertEqual(data["biography"], "Updated bio")

        # Bad case - unauthenticated request
        self.client.force_authenticate(user=None)
        response = self.client.put("/user/", update_data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Bad case - wrong current password
        self.client.force_authenticate(user=user)
        response = self.client.put(
            "/user/",
            {
                "password": "wrongpass",
                "new_password": "newpass123",
            },
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content)["error"], "Old password is not in the database"
        )

        # Bad case - missing required fields for password update
        update_data = {
            "username": "updateduser",
            "new_password": "newpass123",  # Missing current password
        }
        response = self.client.put("/user/", update_data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            json.loads(response.content)["error"], "Old password is required"
        )

    def test_partial_profile_update(self):
        """Test updating only specific fields of user profile"""
        user = User.objects.create_user(
            username="partialtest",
            email="partial@example.com",
            password="partial123",
            phone_number="55555555",
        )
        self.client.force_authenticate(user=user)

        # Update only username
        response = self.client.put(
            "/user/", {"username": "newusername"}, format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)["username"], "newusername")

        # Update only phone number
        response = self.client.put(
            "/user/", {"phone_number": "66666666"}, format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)["phone_number"], "66666666")

        # Update only biography
        response = self.client.put(
            "/user/", {"biography": "New bio"}, format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)["biography"], "New bio")

    def test_delete_user(self):
        """Test delete user"""
        user = User.objects.create_user(
            username="deleteusertest",
            email="deleteusertest@example.com",
            password="deleteuserpartial123",
            phone_number="12341234",
        )
        self.client.force_authenticate(user=user)

        # Delete user
        response = self.client.delete("/user/", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            User.objects.filter(email="deleteusertest@example.com").count(), 0
        )

        # Delete user without authentication
        self.client.force_authenticate(None)
        response = self.client.delete("/user/", format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
