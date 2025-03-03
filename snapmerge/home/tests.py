from django.test import TestCase, RequestFactory
from django.test.client import Client
from django.db import models
from . import models

from . import views

# Create your tests here.


class TestMerge(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test(self):
        self.assertTrue(True)


class TestProjectModel(TestCase):
    def setUp(self):
        # Every test needs access to the request factory.
        self.factory = RequestFactory()
        self.client = Client()

    def test_project_create(self):
        proj = models.Project.create_and_save(
            name="Class 10a",
            picture="TODO",
            description="The first Snap! Project of class 10a",
        )
        self.assertEquals(len(models.Project.objects.all()), 1)
        self.assertEquals(proj.name, "Class 10a")
        self.assertEquals(proj.picture, "TODO")
        self.assertEquals(proj.description, "The first Snap! Project of class 10a")

    def test_string_representation(self):
        proj = models.Project.create_and_save(
            name="Class 10a",
            picture="TODO",
            description="The first Snap! Project of class 10a",
        )
        self.assertEquals(str(proj), "Class 10a")


# class TestSnapFileModel(TestCase):
#     def test_file_create(self):
#         # Proj
#         proj = models.Project.create_and_save(name="Class 10a",
#                                               picture="TODO",
#                                               description="The first Snap! Project of class 10a")

#         file = models.SnapFile.create_and_save(project=proj,
#                                                file="filepath")
#         self.assertEquals(len(models.SnapFile.objects.all()), 1)

#     def test_ancestors(self):
#         # Proj
#         proj = models.Project.create_and_save(name="Class 10a",
#                                               picture="TODO",
#                                               description="The first Snap! Project of class 10a")
#         file = models.SnapFile.create_and_save(project=proj,
#                                                file="filepath")
#         self.assertEquals(len(models.SnapFile.objects.all()), 1)
#         file2 = models.SnapFile.create_and_save(project=proj,
#                                                file="filepath",
#                                                ancestors=[file])
#         self.assertEquals(len(models.SnapFile.objects.all()), 2)
