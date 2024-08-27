from django.shortcuts import render
import requests
from django.http import HttpResponse
from django.http import JsonResponse

# Create your views here.


def index(request):

    return HttpResponse("Hello, world. You're at the backend index.")


def fetch_json_data(request):
    url = "https://newsapi.org/v2/top-headlines?country=sg&apiKey=61efb81100084a3cb4ddf2e63eba255d"
    response = requests.get(url)
    data = response.json()
    return JsonResponse(data)