from rest_framework import serializers
from .models import Languages, Categories, Questions


class LanguagesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    
    class Meta:
        model = Languages
        fields = ('id', 'code',)
        
class CategoriesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Categories
        fields = ('name', 'language_id',)
        
class QuestionsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Questions
        fields = ('question', 'answer1', 'answer2', 'answer3', 'answer4', 'corr_answer', 'category_id',)

        
        
