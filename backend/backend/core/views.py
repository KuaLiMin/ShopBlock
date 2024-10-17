import json
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import Group
from django.shortcuts import render, get_object_or_404
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
from rest_framework.decorators import authentication_classes, permission_classes, action

from backend.core.models import User, Listing, ListingPhoto, Offer, Review, Transaction
from backend.core.serializers import (
    ListingUpdateSerializer,
    UserSerializer,
    UserCreateSerializer,
    ListingSerializer,
    ListingCreateSerializer,
    OfferSerializer,
    OfferCreateSerializer,
    ReviewSerializer,
    TransactionSerializer,
)

# The views here will be mapped to a url in urls.py
# Try to make specific user views, for each functionality
# Make it small and distinct and easy to work on


class UserController(GenericAPIView):
    """
    User endpoint for GET
    """

    serializer_class = UserSerializer

    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request: Request):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)


class RegisterController(APIView):
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


class ListingController(GenericAPIView):
    """
    Listing endpoint, [GET, POST, DELETE]

    For the GET request, it returns all listings that are stored in the database.
        This will also support searching the listings by name with a query parameter.

    For the POST request, this is the same as "creating" a new listing.

    For the DELETE request, it deletes a specific listing if the user is authorized.
    """

    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    parser_classes = (MultiPartParser, FormParser)

    # user gets a listing
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search listings by name",
                required=False,
                type=str,
            ),
        ],
    )
    def get(self, request: Request):
        queryset = self.get_queryset()
        search_query = request.query_params.get("search", None)
        # if a search query param was passed in
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query)
                | Q(description__icontains=search_query)
            )

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
        if "locations" in request_copy and isinstance(request_copy["locations"], str):
            request_copy["locations"] = json.loads(request_copy["locations"])

        serializer = ListingCreateSerializer(data=request_copy)
        # Use custom serializer for the post request here
        if serializer.is_valid():
            # Add via the JWT-ed user
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Otherwise, the input was not correct
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # user updates a listing
    @extend_schema(
        request=ListingUpdateSerializer,
        responses={200: ListingSerializer},
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def put(self, request: Request):
        listing_id = request.data.get("id")
        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if listing.uploaded_by != request.user:
            return Response(
                {"error": "You don't have permission to update this listing"},
                status=status.HTTP_403_FORBIDDEN,
            )

        request_copy = request.data.copy()
        if "rates" in request_copy and isinstance(request_copy["rates"], str):
            request_copy["rates"] = json.loads(request_copy["rates"])
        if "locations" in request_copy and isinstance(request_copy["locations"], str):
            request_copy["locations"] = json.loads(request_copy["locations"])

        serializer = ListingUpdateSerializer(listing, data=request_copy)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # user deletes a listing
    @extend_schema(
        parameters=[
            OpenApiParameter(name="id", type=int, location=OpenApiParameter.QUERY)
        ],
        responses={204: None, 403: None, 404: None},
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def delete(self, request: Request):
        listing_id = request.query_params.get("id")
        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist:
            return Response(
                {"error": "Listing not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if listing.uploaded_by != request.user:
            return Response(
                {"error": "You don't have permission to delete this listing"},
                status=status.HTTP_403_FORBIDDEN,
            )

        listing.delete()
        return Response(status=status.HTTP_200_OK)


class OfferController(GenericAPIView):
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

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="type",
                type=str,
                location=OpenApiParameter.QUERY,
                description="Type of offers to retrieve: 'received' or 'made'",
                required=False,
                enum=["received", "made"],
            ),
        ],
        responses={200: OfferSerializer(many=True)},
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request: Request):
        offer_type = request.query_params.get("type", "received")

        if offer_type == "received":
            # Get offers for listings uploaded by the current user
            queryset = Offer.objects.filter(listing__uploaded_by=request.user)
        elif offer_type == "made":
            # Get offers made by the current user
            queryset = Offer.objects.filter(offered_by=request.user)

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


class ReviewsController(GenericAPIView):
    """
    Reviews endpoint, [GET, POST]

    For the GET request, it returns all reviews for the requested user

    For the POST request, a user can post a review
    """

    serializer_class = ReviewSerializer

    # The query set should filter out the listing for the user
    def get_queryset(self):
        # Get all listings requested by the JWT-ed user
        user_reviews = Review.objects.filter(user=self.request.user)
        # user_listings = Listing.objects.filter(uploaded_by=self.request.user)
        return user_reviews

    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request: Request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)


class TransactionController(GenericAPIView):
    """
    Transactions endpoint, [GET, POST]

    For the GET request, it returns the all transactions for the user

    For the POST request, once a user completes their payment, it will post to this endpoint to store for transaction history
    """

    serializer_class = TransactionSerializer

    # The query set should filter out the listing for the user
    def get_queryset(self):
        # Get all listings requested by the JWT-ed user
        user_transactions = Transaction.objects.filter(user=self.request.user)
        # user_listings = Listing.objects.filter(uploaded_by=self.request.user)
        return user_transactions

    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request: Request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "offer_id": {"type": "integer"},
                    "amount": {"type": "number"},
                    "status": {
                        "type": "string",
                        "enum": [
                            choice[0]
                            for choice in Transaction.TRANSACTION_STATUS
                        ],
                    },
                    "payment_id": {
                        "type": "string",
                    },
                },
                "required": ["offer_id", "amount"],
            }
        },
        responses={201: TransactionSerializer},
        examples=[
            OpenApiExample(
                "Valid Transaction Creation",
                summary="Create a new transaction",
                description="Create a new transaction for an accepted offer, note that D is Paid",
                value={
                    "offer_id": 1,
                    "amount": 100.00,
                    "status": "D",
                    "payment_id": "QWER1234",
                },
                request_only=True,
            ),
        ],
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request: Request):
        request.data["user_id"] = request.user.id
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            transaction = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DebugUserController(GenericAPIView):
    """
    Admin endpoint to debug the user endpoint
    """

    serializer_class = UserSerializer

    def get(self, request: Request):
        users = User.objects.all()
        serializer = self.serializer_class(users, many=True)
        return Response(serializer.data)


class DebugListingController(GenericAPIView):
    """
    Admin endpoint to debug the listings endpoint
    """

    serializer_class = ListingSerializer

    def get(self, request: Request):
        listings = Listing.objects.all()
        serializer = self.serializer_class(listings, many=True)
        return Response(serializer.data)
