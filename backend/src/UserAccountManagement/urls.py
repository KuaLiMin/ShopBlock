from django.urls import path
from . import views


urlpatterns = [
    # Add your URL patterns here
    path('', views.index, name='index'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('signup/', views.signup, name='signup'),
]