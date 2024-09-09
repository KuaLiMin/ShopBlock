from django.shortcuts import render
import requests
from django.http import HttpResponse
from django.http import JsonResponse

# Create your views here.


def index(request):

    # check sessionstorage for login
    if request.session.get('login', False):
        return render(request, 'browse.html')
    return render(request, 'index.html')
    
    


# def fetch_json_data(request):
#     url = "https://newsapi.org/v2/top-headlines?country=sg&apiKey=61efb81100084a3cb4ddf2e63eba255d"
#     response = requests.get(url)
#     data = response.json()
#     return JsonResponse(data)