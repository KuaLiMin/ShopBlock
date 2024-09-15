from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import Group
from django.shortcuts import render
from rest_framework import permissions, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import authentication_classes, permission_classes

from backend.core.models import User, Listing
from backend.core.serializers import UserSerializer, ListingSerializer

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
    Listing endpoint for GET and POST
    """

    queryset = Listing.objects.all()
    serializer_class = ListingSerializer

    def get(self, request: Request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

    # user posts a listing
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def post(self, request: Request):
        serializer = self.get_serializer(data=request.data)
        # If the form details are correct, then save it into the database
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DebugUserList(GenericAPIView):
    """
    Admin endpoint to debug the user endpoint
    """

    serializer_class = UserSerializer

    def get(self, request: Request):
        return JsonResponse(list(User.objects.values()), safe=False)


class DebugListingList(GenericAPIView):
    """
    Admin endpoint to debug the listings endpoint
    """

    serializer_class = ListingSerializer

    def get(self, request: Request):
        return JsonResponse(list(Listing.objects.values()), safe=False)
