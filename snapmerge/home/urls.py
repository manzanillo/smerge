from django.conf.urls import url, include
from . import views


urlpatterns = [
    url(r'^$', views.HomeView.as_view(), name='home'),
    url(r'^create_project/$', views.CreateProjectView.as_view(), name='create_proj'),
    url(r'^(?P<proj_id>[0-9]+)$', views.ProjectView.as_view(), name='proj'),

]