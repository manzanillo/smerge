from django.conf.urls import url, include
from . import views


urlpatterns = [
    url(r'^$', views.HomeView.as_view(), name='home'),
    url(r'^open_project/$', views.OpenProjectView.as_view(), name='open_proj'),
    url(r'^create_project/$', views.CreateProjectView.as_view(), name='create_proj'),
    url(r'^(?P<proj_id>[-\w]+)$', views.ProjectView.as_view(), name='proj'),
    url(r'^info/(?P<proj_id>[-\w]+)$', views.InfoView.as_view(), name='info'),
    url(r'^merge/(?P<proj_id>[-\w]+)$', views.MergeView.as_view(), name='merge'),
    url(r'^sync/(?P<proj_id>[-\w]+)$', views.SyncView.as_view(), name='sync'),
    url(r'add/(?P<proj_id>[-\w]+)$',views.AddFileToProjectView.as_view(), name='add'),
    url(r'change_password/(?P<proj_id>[-\w]+)$', views.ChangePasswordView.as_view(), name='change_passwd'),
    url(r'delete_proj/(?P<proj_id>[-\w]+)$', views.DeleteProjectView.as_view(), name='delete_proj')
]