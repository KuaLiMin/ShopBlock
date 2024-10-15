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

from backend.core.models import (
    User,
    Listing,
    ListingPhoto,
    Offer,
    Review,
    Transaction,
    Category,
    ListingType,
    TimeUnit,
)
from backend.core.serializers import (
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

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="id",
                description="Get a specific listing by ID",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="search",
                description="Search listings by name",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="category",
                description="Filter listings by category",
                required=False,
                type=str,
                enum=[choice[0] for choice in Category.choices],
            ),
            OpenApiParameter(
                name="listing_type",
                description="Filter listings by listing type",
                required=False,
                type=str,
                enum=[choice[0] for choice in ListingType.choices],
            ),
            OpenApiParameter(
                name="time_unit",
                description="Filter listings by time unit (required for price sorting)",
                required=False,
                type=str,
                enum=[choice[0] for choice in TimeUnit.choices],
            ),
            OpenApiParameter(
                name="sort_by",
                description="Sort listings by price (asc or desc)",
                required=False,
                type=str,
                enum=["price_asc", "price_desc"],
            ),
        ],
    )
    def get(self, request: Request):
        queryset = self.get_queryset()
        listing_id = request.query_params.get("id", None)
        search_query = request.query_params.get("search", None)
        category = request.query_params.get("category", None)
        listing_type = request.query_params.get("listing_type", None)
        time_unit = request.query_params.get("time_unit", None)
        sort_by = request.query_params.get("sort_by", None)

        # If a listing id was provided, we try to retrieve it
        # If the listing does not exist in the databse, then we need to error out
        # If the listing id was not provided, this will be skipped
        if listing_id:
            try:
                listing = Listing.objects.get(id=listing_id)
                serializer = self.get_serializer(listing)
                return JsonResponse(serializer.data)
            except Listing.DoesNotExist:
                return JsonResponse({"error": "Listing not found"}, status=404)

        # filter by search query
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query)
                | Q(description__icontains=search_query)
            )

        # filter by category
        if category:
            queryset = queryset.filter(category=category)

        # filter by listing type filter
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)

        if time_unit:
            queryset = queryset.filter(rates__time_unit=time_unit)

            if sort_by:
                # If sort_by is specified, sort by price
                if sort_by == "price_asc":
                    queryset = queryset.order_by("rates__rate")
                elif sort_by == "price_desc":
                    queryset = queryset.order_by("-rates__rate")
            else:
                queryset = queryset.order_by("-created_at")
        elif sort_by:
            # cannot have sort by without a time_unit
            return Response(
                {"error": "Time unit must be specified when sorting by price"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        else:
            # if neither time_unit nor sort_by are specified, use default sorting
            queryset = queryset.order_by("-created_at")

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

    # @extend_schema(
    #     request=OfferCreateSerializer,
    #     responses={201: OfferCreateSerializer},
    # )
    @extend_schema(
        request=OfferCreateSerializer,
        responses={201: OfferSerializer, 400: {"description": "Bad Request"}},
        examples=[
            OpenApiExample(
                "Offer Creation",
                summary="Create a new offer with scheduling",
                description="Create a new offer for a listing with details about the scheduled time",
                value={
                    "listing_id": 1,
                    "price": 100.00,
                    "scheduled_start": "2023-06-01T10:00:00Z",
                    "scheduled_end": "2023-06-01T12:00:00Z",
                    "time_unit": "H",
                    "time_delta": 2,
                },
                request_only=True,
            ),
        ],
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
                "scheduled_start": request.data.get("scheduled_start"),
                "scheduled_end": request.data.get("scheduled_end"),
                "time_unit": request.data.get("time_unit"),
                "time_delta": request.data.get("time_delta"),
            },
            context={"request": request},
        )

        if serializer.is_valid():
            # Before we save the model into the database, this should check for collision
            listing_id = serializer.validated_data["listing_id"]
            scheduled_start = serializer.validated_data["scheduled_start"]
            scheduled_end = serializer.validated_data["scheduled_end"]

            conflicting_offers = Offer.objects.filter(
                listing_id=listing_id,
                # TODO : This also means that when they post the request
                # any pending offers will be counted as a collision
                # this technically isn't a bug, just something to take note.
                status__in=[Offer.PENDING, Offer.ACCEPTED, Offer.PAID],
                scheduled_start__lt=scheduled_end,
                scheduled_end__gt=scheduled_start,
            )

            if conflicting_offers.exists():
                return Response(
                    {
                        "error": "Schedule collision detected. Please choose a different time."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # if there are no errors, then we will save this into the model
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

    @extend_schema(
        request=ReviewSerializer,
        responses={201: ReviewSerializer},
        description="Create a new review for a user",
        examples=[
            OpenApiExample(
                "Valid Review Creation",
                summary="Create a new review",
                description="Create a new review for a user",
                value={
                    "user_id": 1,
                    "rating": 5,
                    "description": "Great experience working with this user!",
                },
                request_only=True,
            ),
        ],
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request: Request):
        user_id = request.data.get("user_id")

        if not user_id:
            return Response(
                {"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure the reviewer is not reviewing themselves
        if int(user_id) == request.user.id:
            return Response(
                {"error": "You cannot review yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Add the reviewer (current user) to the request data
        request.data['reviewer_id'] = request.user.id
        
        from pprint import pprint
        pprint(request.data)

        serializer = self.get_serializer(data=request.data, context={'request': request})

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
                            choice[0] for choice in Transaction.TRANSACTION_STATUS
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
