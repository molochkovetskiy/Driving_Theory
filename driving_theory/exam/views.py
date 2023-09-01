from django.http import JsonResponse
import requests
import random
from .models import Languages, Categories, Questions, ImagesOfQuestions
from .serializers import LanguagesSerializer, CategoriesSerializer, QuestionsSerializer

from bs4 import BeautifulSoup

from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import render
# from .permissions import IsDepartmentAdmin
# from django.forms import model_to_dict


class LanguagesAPIView(APIView):

    def get(self, request):
        languages = Languages.objects.all()
        serializer = LanguagesSerializer(languages, many=True)
        return Response(serializer.data)


class QuestionsAPIView(APIView):

    def get(self, request, lang_id: int):
        lang_categories = Categories.objects.filter(language_id=lang_id)
        random_20_questions = []

        for category in lang_categories:
            category_questions = list(
                Questions.objects.filter(category_id=category))
            random_five_questions = random.sample(category_questions, 5)
            random_20_questions.extend(random_five_questions)

        serializer = QuestionsSerializer(random_20_questions, many=True)
        return Response(serializer.data)


# clean it up!
class FillDB(APIView):

    def get(self, request):
        apiCodes = {
            "he": "bf7cb748-f220-474b-a4d5-2d59f93db28d",
            "en": "9a197011-adf9-45a2-81b9-d17dabdf990b",
            "ru": "ca264280-1669-45ce-a96f-a4c9ed71e812",
            "es": "e8da3b53-cdd0-4ef9-ae19-ff78c773e882",
            # "ar": "fe998a65-83a3-45e5-b4b7-3e0ce86ae072",
            "fr": "a106ea08-ff97-4971-8720-c85bdd3d2264",
        }
        
        for language_code in apiCodes.keys():


            apiUrl = f'https://data.gov.il/api/3/action/datastore_search?resource_id={apiCodes[language_code]}&limit=2000'
            response = requests.get(apiUrl)
            data = response.json()
            resData = data["result"]["records"]

            for item in resData:
                category = item["category"]
                question = item["title2"]
                language = language_code
                questions = item["description4"]

                soup = BeautifulSoup(questions, "html.parser")
                span_tags = soup.find_all("span")
                answers = [span_tag.text for span_tag in span_tags]

                for index, span_tag in enumerate(span_tags[:4]):
                    if span_tag.get('id'):
                        correct_answer_index = index + 1
                        break

                answer1 = answers[0]
                answer2 = answers[1]
                answer3 = answers[2]
                answer4 = answers[3]

                if language_code == "he":
                    img_tags = soup.find('img')
                    if img_tags:
                        image_link = img_tags.get("src")
                        if len(ImagesOfQuestions.objects.filter(num_title=question[:4])) < 1:
                            ImagesOfQuestions.objects.create(
                                num_title=question[:4],
                                image_link = image_link,
                            )
                
                if len(Languages.objects.filter(code=language)) < 1:
                    Languages.objects.create(
                        code=language,
                    )

                if len(Categories.objects.filter(name=category)) < 1:
                    Categories.objects.create(
                        name=category,
                        language_id=Languages.objects.get(code=language),
                    )

                if ImagesOfQuestions.objects.filter(num_title=question[:4]).exists():
                    image_exists = ImagesOfQuestions.objects.get(num_title=question[:4])
                else:
                    image_exists = None

                if len(Questions.objects.filter(question=question)) < 1:
                    Questions.objects.create(
                        question=question,
                        answer1=answer1,
                        answer2=answer2,
                        answer3=answer3,
                        answer4=answer4,
                        corr_answer=correct_answer_index,
                        image_id = image_exists,
                        category_id = Categories.objects.get(name=category),
                    )

        return Response({"status": "ok"})


def exam(request):
    return render(request, 'exam/index.html')
