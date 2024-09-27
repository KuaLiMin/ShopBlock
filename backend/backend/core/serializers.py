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
