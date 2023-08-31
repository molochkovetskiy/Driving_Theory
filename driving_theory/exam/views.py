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
import random
from .models import Languages, Categories, Questions
from bs4 import BeautifulSoup
from django.forms import model_to_dict




def get_languages(request):
    languages = Languages.objects.all()
    print('#####################')
    print(languages)
    print('#####################')
    langDict = [model_to_dict(language) for language in languages] 
    return JsonResponse(langDict, safe=False)


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
        
def get_exam_questions(request, lang_id:int):
    lang_categories = Categories.objects.filter(language_id=lang_id)
    random_20_questions = []
    
    for category in lang_categories:
        category_questions = list(Questions.objects.filter(category_id=category))
        random_five_questions = random.sample(category_questions, 5)
        random_20_questions.extend(random_five_questions)
        
    random_20_questions_dict = [model_to_dict(question) for question in random_20_questions] 
    return JsonResponse(random_20_questions_dict, safe=False)