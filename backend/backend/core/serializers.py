import json
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
    Offer,
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

    def get_avatar(self, obj):
        if obj.avatar:
            return self.context["request"].build_absolute_uri(obj.avatar.url)
        return None

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserCreateSerializer(UserSerializer):
    avatar = (
        serializers.ImageField(
            max_length=1000000, allow_empty_file=False, use_url=False
        ),
    )

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields

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
        required=True,  # This makes it easy for me for now
    )

    rates = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(),  # Handle individual rate fields
        ),
        write_only=True,
    )

    class Meta(ListingSerializer.Meta):
        fields = ListingSerializer.Meta.fields + ["photos", "rates"]

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
            ListingRate.objects.create(
                listing=listing,
                time_unit=rate_data["time_unit"],
                rate=rate_data["rate"],
            )

        return listing


# Serializer for get request
class OfferSerializer(serializers.ModelSerializer):
    offered_by = serializers.SerializerMethodField()
    listing = serializers.SerializerMethodField()
    status = serializers.ChoiceField(choices=Offer.STATUS_CHOICES, read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Offer
        fields = ["id", "offered_by", "listing", "price", "status", "created_at"]

    # For all offered_by, show the user detail that is offering
    def get_offered_by(self, obj):
        return {
            "id": obj.offered_by.id,
            "username": obj.offered_by.username,
            "email": obj.offered_by.email,
        }

    # Show the listing detail for the offer
    def get_listing(self, obj):
        return {
            "id": obj.listing.id,
            "title": obj.listing.title,
            "category": obj.listing.get_category_display(),
        }


# Serializer for post request
class OfferCreateSerializer(serializers.Serializer):
    offered_by = serializers.StringRelatedField()
    listing_id = serializers.IntegerField()
    price = serializers.DecimalField(max_digits=10, decimal_places=2)

    # Check that they are not submitting junk listings
    def validate_listing_id(self, value):
        try:
            Listing.objects.get(id=value)
        except Listing.DoesNotExist:
            raise serializers.ValidationError("Listing does not exist")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        listing = Listing.objects.get(id=validated_data["listing_id"])
        return Offer.objects.create(
            offered_by=user,
            listing=listing,
            price=validated_data["price"],
        )
