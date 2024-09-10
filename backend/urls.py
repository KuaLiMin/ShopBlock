from django.urls import path


from . import views

from django.urls import include
from backend.src.UserAccountManagement import views as user_views


urlpatterns = [
    path('', views.index),
    path('browse/', include('backend.src.Browsing.urls')),
    path('listing/', include('backend.src.Listing.urls')),
    path('user/', include('backend.src.UserAccountManagement.urls')),
    path('review/', include('backend.src.Review.urls')),
    path('payment/', include('backend.src.Payment.urls')),
]