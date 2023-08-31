from django.db import models

# Create your models here.
class Languages(models.Model):
    code = models.CharField(max_length=5, unique=True)


class Categories(models.Model):
    name = models.CharField(max_length=50)
    language_id = models.ForeignKey('Languages', on_delete=models.CASCADE)
    


class Questions(models.Model):
    question = models.TextField()
    answer1 = models.TextField()
    answer2 = models.TextField()
    answer3 = models.TextField()
    answer4 = models.TextField()
    corr_answer = models.SmallIntegerField()
    category_id = models.ForeignKey('Categories', on_delete=models.CASCADE)