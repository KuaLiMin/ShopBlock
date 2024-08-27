from django.urls import path

from . import views
from .views import fetch_json_data

urlpatterns = [
    path('fetch-json/', fetch_json_data, name='fetch_json_data'),

]