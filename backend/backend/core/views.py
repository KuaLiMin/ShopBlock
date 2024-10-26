import json
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import Group
from django.shortcuts import render, get_object_or_404
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiExample,
    inline_serializer,
)
from drf_spectacular.types import OpenApiTypes
from rest_framework import permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import (
    authentication_classes,
    permission_classes,
    parser_classes,
)
from django.contrib.auth.hashers import check_password
from rest_framework import status, serializers
from django.contrib.auth.hashers import make_password

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
    ListingUpdateSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    UserCreateSerializer,
    ListingSerializer,
    ListingCreateSerializer,
    OfferSerializer,
    OfferCreateSerializer,
    ReviewSerializer,
    TransactionSerializer,
    UserUpdateSerializer,
    CustomTokenObtainPairSerializer,
)

# The views here will be mapped to a url in urls.py
# Try to make specific user views, for each functionality
# Make it small and distinct and easy to work on


class UserController(GenericAPIView):
    """
    User endpoint for GET, PUT

    GET gets the details of the user

    PUT updates the details of the user
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="User ID for unauthenticated requests",
                required=False,
            )
        ],
        responses={200: UserSerializer},
        description="Get user details. Returns authenticated user if JWT is provided, otherwise returns user based on query parameter 'id'.",
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request: Request):
        if request.user.is_authenticated:
            user = request.user
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        else:
            # Unauthenticated request, try to get param
            user_id = request.query_params.get("id")
            if not user_id:
                return Response(
                    {"error": "User ID is required for unauthenticated requests"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            user = get_object_or_404(self.queryset, id=user_id)

        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @parser_classes([MultiPartParser, FormParser])
    def post(self, request: Request):
        # Check if the email already exists - all emails are unique
        # reject if the email exists
        if "email" not in request.data:
            return Response(
                "Requires an email to register an account",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "phone_number" not in request.data:
            return Response(
                "Requires a phone number to register an account",
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=request.data["email"]).exists():
            return Response(
                {"error": "Email already registered"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(phone_number=request.data["phone_number"]).exists():
            return Response(
                {"error": "Phone number already registered"},
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

    # user updates their profile
    @extend_schema(
        request=UserUpdateSerializer,
        responses={200: UserSerializer},
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def put(self, request: Request):
        user = request.user

        # Only allow the user to update their own profile information if they are authenticated
        if not user.is_authenticated:
            return Response(
                {"error": "You must be authenticated to update your profile"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Probably dont need the serializer
        # serializer = UserUpdateSerializer(data=request.data)
        # if not serializer.is_valid():
        #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Update other optional fields
        if "username" in request.data:
            user.username = request.data["username"]
        if "phone_number" in request.data:
            user.phone_number = request.data["phone_number"]
        if "avatar" in request.data:
            user.avatar = request.data["avatar"]
        if "biography" in request.data:
            user.biography = request.data["biography"]

        # Update password if requested
        if "new_password" in request.data:
            if "password" not in request.data:
                return Response(
                    {"error": "Old password is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not check_password(request.data["password"], user.password):
                return Response(
                    {"error": "Old password is not in the database"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.password = make_password(request.data["new_password"])

        # Save the updated user information
        user.save()

        # Return the updated user data
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)



class ListingController(GenericAPIView):
    """
    Listing endpoint, [GET, POST, PUT, DELETE]

    For the GET request, it returns all listings that are stored in the database.
        This will also support searching the listings by name with a query parameter.

    For the POST request, this is the same as "creating" a new listing.

    For the PUT request, this will allow the user to update their posted listings.

    For the DELETE request, it deletes a specific listing if the user is authorized.
    """

    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    parser_classes = (MultiPartParser, FormParser)

    # user gets a listing
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
        # if "rates" in request_copy and isinstance(request_copy["rates"], str):
        #     request_copy["rates"] = json.loads(request_copy["rates"])
        # if "locations" in request_copy and isinstance(request_copy["locations"], str):
        #     request_copy["locations"] = json.loads(request_copy["locations"])

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
                name="listing_id",
                type=int,
                location=OpenApiParameter.QUERY,
                description="ID of the specific listing to retrieve offers for",
                required=False,
            ),
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
        listing_id = request.query_params.get("listing_id")
        offer_type = request.query_params.get("type", "received")

        if listing_id:
            listing = get_object_or_404(Listing, id=listing_id)
            queryset = Offer.objects.filter(listing=listing)
            serializer = self.get_serializer(queryset, many=True)
            return JsonResponse(serializer.data, safe=False)

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

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="user_id",
                type=int,
                location=OpenApiParameter.QUERY,
                description="Get reviews for a specific user by ID",
                required=False,
            ),
        ],
        responses={200: OfferSerializer(many=True)},
    )
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def get(self, request: Request):
        user_id = request.query_params.get("user_id")
        if request.user.is_authenticated:
            if user_id:
                queryset = Review.objects.filter(user=user_id)
            else:
                queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return JsonResponse(serializer.data, safe=False)
        else:
            if user_id:
                queryset = Review.objects.filter(user=user_id)
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

        if not request.user.is_authenticated:
            return Response(
                {"error": "You must be authenticated to update your profile"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

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
        request.data["reviewer_id"] = request.user.id

        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )

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
        if request.user.is_authenticated:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return JsonResponse(serializer.data, safe=False)

        # Unauthorized permission
        return Response(
            {"error": "Not logged in"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

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
                    "status": "C",
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

        if request.user.is_authenticated:
            if serializer.is_valid():
                transaction = serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {"error": "Not logged in"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

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


class ResetPasswordController(APIView):
    """
    Reset password endpoint, [PUT]

    The put method is used to reset the password of the user if both email and number match in the database
    """

    serializer_class = ResetPasswordSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def put(self, request):
        # test against both email and phone number, if both match, then reset the password
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get("email")
            phone_number = serializer.validated_data.get("phone_number")
            new_password = serializer.validated_data.get("new_password")
            user = User.objects.get(email=email, phone_number=phone_number)
            user.password = make_password(new_password)
            user.save()
            return Response(
                {"message": "Password reset successfully"}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginController(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_401_UNAUTHORIZED)
