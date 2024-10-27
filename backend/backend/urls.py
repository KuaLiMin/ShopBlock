"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


from backend.core import views
from rest_framework import routers

urlpatterns = [
    # default django admin portal
    path("admin/", admin.site.urls),
    # debugging purposes
    # path("debug/user/", views.DebugUserController.as_view()),
    # path("debug/listing/", views.DebugListingController.as_view()),
    # listings [GET, POST, DELETE]
    path("listing/", views.ListingController.as_view(), name="listing"),
    # user routes, [GET, POST, PUT]
    path("user/", views.UserController.as_view()),
    # offer routes, [GET, POST, PUT]
    path("offers/", views.OfferController.as_view()),
    # review routes, [GET, POST]
    path("reviews/", views.ReviewsController.as_view()),
    # review routes, [GET, POST]
    path("transactions/", views.TransactionController.as_view()),
    # reset password route, [PUT]
    path("reset-password/", views.ResetPasswordController.as_view()),
    # authentication jwt tokens
    path("api/login/", views.LoginController.as_view(), name="token_obtain_pair"),
    # path("api/login/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # swagger and redoc
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/schema/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

# This is quite a hack to keep things to be a monolith as much as possible
# ideally in prod, we would just serve it over nginx but i think this will
# change quickly so it's fine to dev like this - there's not much
# media content to be served for now anwyay
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
