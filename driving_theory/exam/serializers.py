from rest_framework import serializers
from .models import Languages, Categories, Questions, ImagesOfQuestions


class LanguagesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    
    class Meta:
        model = Languages
        fields = "__all__" 
        
class CategoriesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Categories
        fields = "__all__"
        
class QuestionsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Questions
        fields = "__all__"
        

class ImagesOfQuestionsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    
    class Meta:
        model = ImagesOfQuestions
        fields = "__all__"
        
        
