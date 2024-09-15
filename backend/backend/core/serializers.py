from rest_framework import serializers
from backend.core.models import User, Category, Listing, ListingPhoto, ListingType


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "password", "avatar")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = UserProfile.objects.create_user(**validated_data)
        return user


class ListingPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingPhoto
        fields = ["id", "image"]


class ListingSerializer(serializers.ModelSerializer):
    photos = ListingPhotoSerializer(many=True, read_only=True)
    category = serializers.ChoiceField(choices=Category.choices)
    listing_type = serializers.ChoiceField(choices=ListingType.choices)

    class Meta:
        model = Listing
        fields = [
            "id",
            "created_at",
            "updated_at",
            "title",
            "description",
            "category",
            "listing_type",
            "photos",
        ]
        read_only_fields = ["created_at", "updated_at"]
