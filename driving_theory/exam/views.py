from django.http import JsonResponse
from django.shortcuts import render
# import os
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'books_project.settings')
# import django
# django.setup() 
# from datetime import datetime
# from exam.models import Categories, Languages, Questions
# import urllib
import requests
from .models import Languages, Categories, Questions
from bs4 import BeautifulSoup

# clean it up!
def fill_db(request): 

    apiUrl = 'https://data.gov.il/api/3/action/datastore_search?resource_id=9a197011-adf9-45a2-81b9-d17dabdf990b&limit=2000'

    response = requests.get(apiUrl)
    data = response.json()
    resData = data['result']['records']

    for item in resData:
        category = item["category"]
        question = item["title2"]
        language = item["language"]
        questions = item["description4"]
        soup = BeautifulSoup(questions, 'html.parser')
        span_tags = soup.find_all('span')
        answers = [span_tag.text for span_tag in span_tags]

        for index, span_tag in enumerate(span_tags[:4]):
            if span_tag.get('id'):
                correct_answer_index = index + 1
                break

        answer1 = answers[0]
        answer2 = answers[1]
        answer3 = answers[2]
        answer4 = answers[3]
        
        if len(Languages.objects.filter(code=language)) < 1:
            Languages.objects.create(
                code = language,
            )
        
        if len(Categories.objects.filter(name=category)) < 1:
            Categories.objects.create(
                name = category,
                language_id = Languages.objects.get(code=language),
            )
        if len(Questions.objects.filter(question=question)) < 1:    
            Questions.objects.create(
                question = question,
                answer1 = answer1,
                answer2 = answer2,
                answer3 = answer3,
                answer4 = answer4,
                corr_answer = correct_answer_index,
                category_id = Categories.objects.get(name=category),
            )
        
    return JsonResponse({"status": "ok"})
        
# def get_exam_questions(request):
    