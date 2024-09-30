import json
from django.db import transaction
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import Group
from django.shortcuts import render
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from rest_framework import permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import authentication_classes, permission_classes

from backend.core.models import User, Listing, ListingPhoto
from backend.core.serializers import (
    UserSerializer,
    ListingSerializer,
    ListingCreateSerializer,
)

# The views here will be mapped to a url in urls.py
# Try to make specific user views, for each functionality
# Make it small and distinct and easy to work on


class UserView(GenericAPIView):
    """
    User endpoint for GET
    """

    serializer_class = UserSerializer

    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request: Request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)


class RegisterUserView(APIView):
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        # Check if the email already exists - all emails are unique
        # reject if the email exists
        if User.objects.filter(email=request.data["email"]).exists():
            return Response(
                {"error": "Email already registered"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Serialize the user data
        serializer = UserSerializer(data=request.data)

        # If data is successfully serialized then save it into the db
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Default response is bad request
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListingView(GenericAPIView):
    """
    Listing endpoint, [GET, POST]

    For the GET request, it returns all listings that are stored in the database.

    For the POST request, this is the same as "creating" a new listing.
    """

    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request: Request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

    # user posts a listing
    @extend_schema(
        request=ListingCreateSerializer,
        responses={201: ListingSerializer},
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request: Request):
        request_copy = request.data.copy()
        if "rates" in request_copy and isinstance(request_copy["rates"], str):
            request_copy["rates"] = json.loads(request_copy["rates"])

        serializer = ListingCreateSerializer(data=request_copy)
        # Use custom serializer for the post request here
        if serializer.is_valid():
            # Add via the JWT-ed user
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Otherwise, the input was not correct
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class DebugUserList(GenericAPIView):
    """
    Admin endpoint to debug the user endpoint
    """

    serializer_class = UserSerializer

    def get(self, request: Request):
        users = User.objects.all()
        serializer = self.serializer_class(users, many=True)
        return Response(serializer.data)


class DebugListingList(GenericAPIView):
    """
    Admin endpoint to debug the listings endpoint
    """

    serializer_class = ListingSerializer

    def get(self, request: Request):
        listings = Listing.objects.all()
        serializer = self.serializer_class(listings, many=True)
        return Response(serializer.data)
