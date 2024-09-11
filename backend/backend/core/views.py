from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import Group
from django.shortcuts import render
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.generics import GenericAPIView
from backend.core.models import User, Listing

from backend.core.serializers import UserSerializer, ListingSerializer

# Create your views here.


# class UserViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint that allows users to be viewed or edited.
#     """

#     queryset = User.objects.all().order_by("-date_joined")
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAuthenticated]


# class GroupViewSet(viewsets.ModelViewSet):
#     """
#     API endpoint that allows groups to be viewed or edited.
#     """

#     queryset = Group.objects.all().order_by("name")
#     serializer_class = GroupSerializer
#     permission_classes = [permissions.IsAuthenticated]


class UserView(GenericAPIView):
    """
    User endpoint for GET
    """

    serializer_class = UserSerializer

    def get(self, request: Request):
        return JsonResponse(list(User.objects.values()), safe=False)


class ListingView(GenericAPIView):
    """
    Listing endpoint for GET and POST
    """

    serializer_class = ListingSerializer

    def get(self, request: Request):
        return JsonResponse(list(Listing.objects.values()), safe=False)


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
