from rest_framework import serializers
from django.db.models import Avg
from backend.core.models import (
    User,
    Category,
    TimeUnit,
    Listing,
    ListingRate,
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
        user = User.objects.create_user(**validated_data)
        return user


class ListingPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ListingPhoto
        fields = ["image_url"]

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


class ListingRateSerializer(serializers.ModelSerializer):
    time_unit = serializers.ChoiceField(choices=TimeUnit.choices)

    class Meta:
        model = ListingRate
        fields = ["time_unit", "rate"]


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
    rates = ListingRateSerializer(many=True, read_only=True)

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
            "rates",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_created_by(self, obj):
        user = User.objects.get(email=obj.uploaded_by)
        return user.username


# Specific serializer for POSTing a Listing
# then this will split into the listing and listing_photos table
class ListingCreateSerializer(ListingSerializer):
    photos = serializers.ListField(
        child=serializers.ImageField(
            max_length=1000000, allow_empty_file=False, use_url=False
        ),
        write_only=True,
    )
    rates = ListingRateSerializer(many=True, required=False)

    class Meta(ListingSerializer.Meta):
        fields = ListingSerializer.Meta.fields + ["photos"]

    def create(self, validated_data):
        # Extract the photos from the validated data
        photos_data = validated_data.pop("photos", [])
        # Extract the rates from the validated data
        rates_data = validated_data.pop("rates", [])

        # Create the base Listing object
        listing = Listing.objects.create(**validated_data)

        # Create a listing photo for each object, then link the listing FK back to it
        for photo in photos_data:
            ListingPhoto.objects.create(listing=listing, image_url=photo)

        # Create listing rating for included rating
        for rate_data in rates_data:
            ListingRate.objects.create(listing=listing, **rates_data)

        return listing
