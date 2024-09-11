from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import Group
from django.shortcuts import render
from rest_framework import permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from backend.core.models import User, Listing

from backend.core.serializers import GroupSerializer, UserSerializer

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


class UserView(APIView):
    """
    User endpoint for GET
    """

    def get(self, request: Request):
        return JsonResponse(list(User.objects.values()), safe=False)


class ListingView(APIView):
    """
    Listing endpoint for GET and POST
    """

    def get(self, request: Request):
        return JsonResponse(list(Listing.objects.values()), safe=False)


class DebugUserList(APIView):
    """
    Admin endpoint to debug the user endpoint
    """

    def get(self, request: Request):
        return JsonResponse(list(User.objects.values()), safe=False)


class DebugListingList(APIView):
    """
    Admin endpoint to debug the listings endpoint
    """

    def get(self, request: Request):
        return JsonResponse(list(Listing.objects.values()), safe=False)
