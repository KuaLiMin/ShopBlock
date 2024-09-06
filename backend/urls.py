from django.urls import path


from . import views
from django.urls import include

urlpatterns = [
    path('', views.index, name='index'),
    path('browse/', include('backend.src.Browsing.urls')),
    path('listing/', include('backend.src.Listing.urls')),
    path('user/', include('backend.src.UserAccountManagement.urls')),
    path('review/', include('backend.src.Review.urls')),
    path('payment/', include('backend.src.Payment.urls')),
]