from rest_framework import serializers
from django.db.models import Avg
from backend.core.models import (
    User,
    Category,
    Listing,
    ListingPhoto,
    ListingType,
    Review,
)


class UserSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "username", "password", "avatar", "average_rating")
        extra_kwargs = {"password": {"write_only": True}}

    def get_average_rating(self, obj):
        # Get all reviews for received by this user and aggregate the average
        avg_rating = Review.objects.filter(user=obj).aggregate(Avg("rating"))[
            "rating__avg"
        ]
        return avg_rating if avg_rating is not None else 0

    def create(self, validated_data):
        user = UserProfile.objects.create_user(**validated_data)
        return user


class ListingPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ListingPhoto
        fields = ["id", "image_url"]

    # This will return the a path to the image
    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image_url and hasattr(obj.image_url, "url"):
            return (
                request.build_absolute_uri(obj.image_url.url)
                if request
                else obj.image_url.url
            )
        return None


class ListingSerializer(serializers.ModelSerializer):
    # the source = listingphoto_set tells django to look for the reverse
    # relationship from Listing -> ListingPhoto
    # i.e. for each Listing, get all ListingPhotos, then serialize it through
    # the ListingPhotoSerializer
    photos = ListingPhotoSerializer(
        many=True, read_only=True, source="listingphoto_set"
    )
    category = serializers.ChoiceField(choices=Category.choices)
    listing_type = serializers.ChoiceField(choices=ListingType.choices)
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "title",
            "description",
            "category",
            "listing_type",
            "photos",
            "longitude",
            "latitude",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_created_by(self, obj):
        user = User.objects.get(email=obj.uploaded_by)
        print(obj.uploaded_by)
        print(user)
        return user.username
