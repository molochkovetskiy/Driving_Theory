from django.db import models

# Create your models here.

class ImagesOfQuestions(models.Model):
    num_title = models.CharField(max_length=10, unique=True)
    image_link = models.CharField(max_length=255, null=True)

    def __str__(self):
        return f"{self.num_title}, {self.image_link}"


class Languages(models.Model):
    code = models.CharField(max_length=5, unique=True)
    
    def __str__(self):
        return f"{self.id}, {self.code}"


class Categories(models.Model):
    name = models.CharField(max_length=50)
    language_id = models.ForeignKey('Languages', on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.id}, {self.name}, {self.language_id}"


class Questions(models.Model):
    question = models.TextField()
    answer1 = models.TextField()
    answer2 = models.TextField()
    answer3 = models.TextField()
    answer4 = models.TextField() 
    corr_answer = models.SmallIntegerField()
    image_id = models.ForeignKey('ImagesOfQuestions', null=True, on_delete=models.CASCADE)
    category_id = models.ForeignKey('Categories', on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.id}, {self.corr_answer}, {self.category_id}, {self.question}"
    
# class Results(models.Model):
#     exam_id = models.