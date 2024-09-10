from django.shortcuts import render, redirect
from django.http import HttpResponse

def index(request):
    return HttpResponse("you are in the UserAccountManagement index page")

def login(request):
    return HttpResponse("you are in the login page")

def logout(request):
    return HttpResponse("you are in the logout page")

def signup(request): 
    return HttpResponse("you are in the register page")

