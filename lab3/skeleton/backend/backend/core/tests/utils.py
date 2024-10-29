import io
import os
import requests
from urllib.parse import urlparse
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image


def get_test_photo():
    # Seed a listing photo - sample cat image
    image_url = "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg"
    response = requests.get(image_url)

    url_path = urlparse(image_url).path
    file_name = os.path.basename(url_path)

    image_content = ContentFile(response.content)
    image_file = SimpleUploadedFile(
        file_name,
        image_content.read(),
        content_type=response.headers.get("content-type"),
    )
    return image_file


def get_blank_photo(filename="test_photo.jpg"):
    # Create a small test image in memory
    file_obj = io.BytesIO()
    image = Image.new("RGB", (100, 100), "white")
    image.save(file_obj, "JPEG")
    file_obj.seek(0)

    return SimpleUploadedFile(filename, file_obj.read(), content_type="image/jpeg")
