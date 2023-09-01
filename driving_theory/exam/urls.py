from django.contrib import admin
from django.urls import path, include
from exam.views import  LanguagesAPIView, FillDB, QuestionsAPIView 

urlpatterns = [
    path('fill-db/',  FillDB.as_view(), name="fill_db"),
    path('languages/',  LanguagesAPIView.as_view(), name="languages"),
    path('get-exam-questions/<int:lang_id>',  QuestionsAPIView.as_view(), name="get_exam_questions"),
]
