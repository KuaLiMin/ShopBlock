import json
from django.db import transaction
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import Group
from django.shortcuts import render
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
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

from backend.core.models import User, Listing, ListingPhoto, Offer
from backend.core.serializers import (
    UserSerializer,
    UserCreateSerializer,
    ListingSerializer,
    ListingCreateSerializer,
    OfferSerializer,
    OfferCreateSerializer,
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
    serializer_class = UserCreateSerializer
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        # Check if the email already exists - all emails are unique
        # reject if the email exists
        if User.objects.filter(email=request.data["email"]).exists():
            return Response(
                {"error": "Email already registered"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Serialize the user data
        serializer = UserCreateSerializer(data=request.data)

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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OfferView(GenericAPIView):
    """
    Offers endpoint, [GET, POST, PUT]

    For the GET request, it returns all offers for the given user

    For the POST request, the use case is for a authenticated user, browsing the listing page,
    then making an offer to the listing

    For the PUT request, the use case is to accept or reject an offer
    """

    serializer_class = OfferSerializer

    # The query set should filter out the listing for the user
    def get_queryset(self):
        # Get all listings requested by the JWT-ed user
        user_listings = Listing.objects.filter(uploaded_by=self.request.user)
        return Offer.objects.filter(listing__in=user_listings)

    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request: Request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

    @extend_schema(
        request=OfferCreateSerializer,
        responses={201: OfferCreateSerializer},
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request: Request):
        # Need to pass in context manually as the default serializer is the get serializer
        serializer = OfferCreateSerializer(
            data={
                "offered_by": request.user,
                "listing_id": request.data.get("listing_id"),
                "price": request.data.get("price"),
            },
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        examples=[
            OpenApiExample(
                "Example1",
                summary="Example offer PUT",
                description="Accept or Reject offer",
                value={
                    "offer_id": 1,
                    "action": "accept",
                },
            ),
        ],
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "offer_id": {"type": "integer"},
                    "action": {"type": "string", "enum": ["accept", "reject"]},
                },
                "required": ["offer_id", "action"],
            }
        },
        responses={200: OfferSerializer},
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def put(self, request: Request):
        offer_id = request.data.get("offer_id")
        action = request.data.get("action")

        # Look for the offer, if it exists
        try:
            offer = Offer.objects.get(
                id=offer_id, listing__uploaded_by=request.user, status=Offer.PENDING
            )
        except Offer.DoesNotExist:
            return Response(
                {"error": "Offer not found or not pending"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if action == "accept":
            offer.accept()
        elif action == "reject":
            offer.reject()
        else:
            return Response(
                {"error": "Invalid action. Use 'accept' or 'reject'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(offer)
        return Response(serializer.data)


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
