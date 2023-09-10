from django.contrib import admin
from django.urls import path, include
from exam.views import  LanguagesAPIView, FillDB, QuestionsAPIView, ImageAPIView, ExamPageView, HomePageView, ResultsView, RegisterUser, LoginUser, logout_user

urlpatterns = [
    path('fill-db/',  FillDB.as_view(), name="fill_db"),
    path('languages/',  LanguagesAPIView.as_view(), name="languages"),
    path('get-exam-questions/<int:lang_id>',  QuestionsAPIView.as_view(), name="get_exam_questions"),
    path('get-img/<int:img_id>',  ImageAPIView.as_view(), name="get_img"),
    path('exam/', ExamPageView.as_view(), name='exam'),
    path('index/', HomePageView.as_view(), name='index'),
    path('results/', ResultsView.as_view(), name='results'),
    path('register/', RegisterUser.as_view(), name='register'),
    path('login/', LoginUser.as_view(), name='login'),
    path('logout/', logout_user, name='logout'),
]
