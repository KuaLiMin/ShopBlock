from rest_framework import serializers
from backend.core.models import User, Category, Listing, ListingPhoto, ListingType


# TODO : The fields need to be updated correctly
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "username", "phone_number"]


class ListingPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingPhoto
        fields = ["id", "image"]


class ListingSerializer(serializers.ModelSerializer):
    photos = ListingPhotoSerializer(many=True, read_only=True)
    category = serializers.ChoiceField(choices=Category.choices)
    type = serializers.ChoiceField(choices=ListingType.choices)

    class Meta:
        model = Listing
        fields = [
            "id",
            "created_at",
            "updated_at",
            "title",
            "description",
            "photos",
            "category",
            "type",
        ]
        read_only_fields = ["created_at", "updated_at"]
